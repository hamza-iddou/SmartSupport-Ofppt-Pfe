<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workspace extends Model
{
    use HasFactory;
    protected $table = 'workspaces';

    protected $fillable = [
        'name',
        'image',
        'created_by'
    ];

    public function members()
    {
        return $this->belongsToMany(User::class, 'workspace_members', 'workspace_id', 'user_id')
            ->withPivot('is_admin');
    }

     public function admins()
    {
        return $this->belongsToMany(User::class, 'workspace_members', 'workspace_id', 'user_id')
                    ->wherePivot('is_admin', true);
    }

    public function regularMembers()
    {
        return $this->belongsToMany(User::class, 'workspace_members', 'workspace_id', 'user_id')
                    ->wherePivot('is_admin', false);
    }

     public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
