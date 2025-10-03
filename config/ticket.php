<?php

return [
    'max_replies' => env('TICKET_MAX_REPLIES', 10),
    'auto_close_days' => env('TICKET_AUTO_CLOSE_DAYS', 7),
     'daily_limit' => env('TICKET_LIMIT_DAILY', 3),
    'weekly_limit' => env('TICKET_LIMIT_WEEKLY', 5),
];
