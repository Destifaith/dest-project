// If you need to add category field, run this migration:
// php artisan make:migration add_category_to_gyms_table

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('gyms', function (Blueprint $table) {
            $table->string('category')->default('Strength Training')->after('gym_type');
        });
    }

    public function down()
    {
        Schema::table('gyms', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
