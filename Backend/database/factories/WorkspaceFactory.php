<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;


class WorkspaceFactory extends Factory
{
    
    public function definition()
    {
        return [
             'name' => fake()->company() . ' Project',  
            'image' => fake()->imageUrl(200, 200),      
            'created_by' => User::factory(),
        ];
    }
}
