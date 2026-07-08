<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class UserRole extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $primaryKey = 'id_user_rol';

    protected $fillable = [
        'user_id',
        'id_rol',
        'estado',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function rol()
    {
        return $this->belongsTo(Role::class, 'id_rol', 'id_rol');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('roles_usuario')
            ->logOnly([
                'user_id',
                'id_rol',
                'estado',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}