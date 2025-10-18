<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('store_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g., "FineWineHouse", "Liquorama"
            $table->string('store_hash');
            $table->text('access_token'); // Will be encrypted
            $table->enum('type', ['source', 'target'])->default('source');
            $table->integer('tree_id')->nullable(); // For target stores
            $table->string('tree_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_connected_at')->nullable();
            $table->json('metadata')->nullable(); // Store additional info
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'is_active']);
            $table->index('store_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_connections');
    }
};
