<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class WorkspaceFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => fake()->company() . ' Project',  
            'image' => fake()->imageUrl(200, 200),      
            'created_by' => 1, 
        ];
    }
    
   
    public function forUser($userId)
    {
        return $this->state(function (array $attributes) use ($userId) {
            return [
                'created_by' => $userId,
            ];
        });
    }
}