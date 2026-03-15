<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;


class WorkspacememberFactory extends Factory
{
   
    public function definition()
    {
        return [
            'workspace_id' => Workspace::factory(),  // Creates a new workspace
            'user_id' => User::factory(),            // Creates a new user
            'is_admin' => fake()->boolean(30)
        ];
    }
}
