<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Role extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $primaryKey = 'id_rol';

    protected $fillable = [
        'nombre',
        'descripcion',
        'estado',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles', 'id_rol', 'user_id')
            ->withPivot(['id_user_rol', 'estado', 'deleted_at'])
            ->withTimestamps()
            ->wherePivot('estado', 'activo')
            ->wherePivotNull('deleted_at');
    }

    public function userRoles()
    {
        return $this->hasMany(UserRole::class, 'id_rol', 'id_rol');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('roles')
            ->logOnly([
                'nombre',
                'descripcion',
                'estado',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}