<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class UnsuspendMembers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'members:unsuspend';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Unsuspend members whose suspension duration has expired';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = now();

        $members = User::where('is_active', false)
            ->whereNotNull('suspended_until')
            ->where('suspended_until', '<=', $now)
            ->get();

        foreach ($members as $member) {
            $member->is_active = true;
            $member->suspended_until = null;
            $member->save();

            $this->info("Member #{$member->id} has been unsuspended.");
        }

        if ($members->isEmpty()) {
            $this->info('No members to unsuspend.');
        }

        return Command::SUCCESS;
    }
}
