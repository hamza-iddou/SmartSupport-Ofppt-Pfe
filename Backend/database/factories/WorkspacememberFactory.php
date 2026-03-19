<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class WorkspaceMemberFactory extends Factory
{
    public function definition()
    {
        return [
            'workspace_id' => 1, 
            'user_id' => 1,      
            'is_admin' => fake()->boolean(30)
        ];
    }
    
   
    public function forWorkspace($workspaceId)
    {
        return $this->state(function (array $attributes) use ($workspaceId) {
            return [
                'workspace_id' => $workspaceId,
            ];
        });
    }
    
    public function forUser($userId)
    {
        return $this->state(function (array $attributes) use ($userId) {
            return [
                'user_id' => $userId,
            ];
        });
    }
}