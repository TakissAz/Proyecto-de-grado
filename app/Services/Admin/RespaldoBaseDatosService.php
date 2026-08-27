<?php

namespace App\Services\Admin;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Symfony\Component\Process\Process;
use Throwable;

class RespaldoBaseDatosService
{
    public function generar(): array
    {
        $conexion = config('database.default');
        $configuracion = config("database.connections.{$conexion}");

        if (($configuracion['driver'] ?? null) !== 'pgsql') {
            throw new RuntimeException('La descarga de respaldos está disponible únicamente para PostgreSQL.');
        }

        $directorio = storage_path('app/private/backups');
        File::ensureDirectoryExists($directorio);
        $nombre = sprintf('nutrigo_%s_%s.backup', preg_replace('/[^A-Za-z0-9_-]/', '_', (string) $configuracion['database']), now()->format('Y-m-d_H-i-s'));
        $ruta = $directorio.DIRECTORY_SEPARATOR.$nombre;

        $proceso = new Process([
            $this->resolverPgDump(),
            '--host='.(string) $configuracion['host'],
            '--port='.(string) $configuracion['port'],
            '--username='.(string) $configuracion['username'],
            '--format=custom',
            '--no-owner',
            '--no-privileges',
            (string) $configuracion['database'],
        ], base_path(), $this->entornoProceso((string) ($configuracion['password'] ?? '')));
        $proceso->setTimeout(300);

        try {
            $archivo = fopen($ruta, 'wb');
            if ($archivo === false) throw new RuntimeException('No se pudo crear el archivo temporal de respaldo.');

            $proceso->run(function (string $tipo, string $contenido) use ($archivo): void {
                if ($tipo === Process::OUT) fwrite($archivo, $contenido);
            });
            fclose($archivo);

            if (! $proceso->isSuccessful()) {
                throw new RuntimeException(trim($proceso->getErrorOutput()) ?: 'pg_dump finalizó con código '.$proceso->getExitCode().'.');
            }
        } catch (Throwable $e) {
            if (isset($archivo) && is_resource($archivo)) fclose($archivo);
            File::delete($ruta);
            Log::error('No se pudo generar el respaldo PostgreSQL.', ['error' => $e->getMessage()]);
            throw new RuntimeException('No se pudo generar el respaldo de la base de datos. Revisa la configuración de PostgreSQL.', previous: $e);
        }

        if (! File::exists($ruta) || File::size($ruta) === 0) {
            File::delete($ruta);
            throw new RuntimeException('PostgreSQL no generó un archivo de respaldo válido.');
        }

        return ['ruta' => $ruta, 'nombre' => $nombre];
    }

    private function resolverPgDump(): string
    {
        $configurado = trim((string) config('database.pg_dump_path'));
        if ($configurado !== '') return $configurado;

        if (PHP_OS_FAMILY === 'Windows') {
            $candidatos = glob('C:\\Program Files\\PostgreSQL\\*\\bin\\pg_dump.exe') ?: [];
            natsort($candidatos);
            if ($candidatos !== []) return (string) end($candidatos);
        }

        return 'pg_dump';
    }

    private function entornoProceso(string $password): array
    {
        $entorno = ['PGPASSWORD' => $password];
        foreach (['SystemRoot', 'WINDIR', 'PATH', 'TEMP', 'TMP'] as $variable) {
            $valor = getenv($variable);
            if ($valor !== false) $entorno[$variable] = $valor;
        }
        return $entorno;
    }
}
