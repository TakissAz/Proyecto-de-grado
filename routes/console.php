<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('nutricion:notificar-seguimientos-pendientes')
    ->dailyAt('23:50')->timezone('America/La_Paz')->withoutOverlapping();
