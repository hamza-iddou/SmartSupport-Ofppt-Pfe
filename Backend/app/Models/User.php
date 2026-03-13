<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

   protected $table = "users"; 
    protected $fillable = [
        'name',
        'last_name',
        'email',
        'is_email_verified',
        'password',
    ];

  
    protected $hidden = [
        'password',
        
    ];

    
    // protected $casts = [
    //     'email_verified_at' => 'datetime',
    // ];
}
