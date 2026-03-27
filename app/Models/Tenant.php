<?php

namespace App\Models;

use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, LogsActivity;

    protected $fillable = [
        'id',
        'company_name',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['id', 'company_name', 'data'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Tenant {$eventName}")
            ->dontSubmitEmptyLogs();
    }

    /**
     * Obtiene el día de pago mensual del tenant.
     */
    public function getDiaPagoMensual(): ?int
    {
        return $this->data['dia_pago_mensual'] ?? null;
    }

    /**
     * Obtiene el monto de cobro mensual del tenant.
     */
    public function getMontoCobro(): ?float
    {
        return $this->data['monto_cobro'] ?? null;
    }

    /**
     * Obtiene el email de contacto del tenant.
     */
    public function getEmailContacto(): ?string
    {
        return $this->data['email_contacto'] ?? null;
    }

    /**
     * Establece el día de pago mensual del tenant.
     */
    public function setDiaPagoMensual(?int $dia): void
    {
        $data = $this->data ?? [];
        if ($dia !== null) {
            $data['dia_pago_mensual'] = $dia;
        } else {
            unset($data['dia_pago_mensual']);
        }
        $this->data = $data;
    }

    /**
     * Establece el monto de cobro mensual del tenant.
     */
    public function setMontoCobro(?float $monto): void
    {
        $data = $this->data ?? [];
        if ($monto !== null) {
            $data['monto_cobro'] = $monto;
        } else {
            unset($data['monto_cobro']);
        }
        $this->data = $data;
    }

    /**
     * Establece el email de contacto del tenant.
     */
    public function setEmailContacto(?string $email): void
    {
        $data = $this->data ?? [];
        if ($email !== null) {
            $data['email_contacto'] = $email;
        } else {
            unset($data['email_contacto']);
        }
        $this->data = $data;
    }
}
