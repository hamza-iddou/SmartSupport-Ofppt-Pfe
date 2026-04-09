<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;



class UserFactory extends Factory
{
    
    public function definition()
    {
        return [
            'name' => fake()->name(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'is_email_verified' => true,
            'password' => 'password', 
        ];
    }

    
    public function unverified()
    {
        return $this->state(fn(array $attributes)=>[
            'is_email_verified' => false,
        ]);
    }
}
