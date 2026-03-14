<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workspace_member extends Model
{
    use HasFactory;

    protected $table = "workspace_members";
    protected $fillable = [
        'is_admin'
    ];
}
