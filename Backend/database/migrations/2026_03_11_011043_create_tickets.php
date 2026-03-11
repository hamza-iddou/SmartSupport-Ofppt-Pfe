<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up()
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId("workspace_id")->constrained("workspaces", "id")->onDelete('cascade');
            $table->foreignId("created_by")->constrained("users");
            $table->foreignId("assigned_to")->nullable()->constrained('users');
            $table->string('title');
            $table->text("description");
            $table->enum("status", ["pending" , "in_progress", "resolved"])->default('pending');
            $table->text("ai_summary")->nullable();
            $table->text("ai_suggestion")->nullable();
            $table->timestamps();
        });
    }

    
    public function down()
    {
        Schema::dropIfExists('tickets');
    }
};
