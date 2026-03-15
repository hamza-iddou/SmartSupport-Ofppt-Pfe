<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkspaceMember extends Model 
{
    use HasFactory;
    
    protected $table = 'workspace_members';
    protected $fillable = [
        'workspace_id',
        'user_id',
        'is_admin'
    ];
    
    public $timestamps = false; 
    
    // Relationships
    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}