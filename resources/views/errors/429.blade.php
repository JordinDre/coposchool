@extends('errors::layout')

@section('title', 'Demasiadas solicitudes')
@section('code', '429')
@section('description', 'Has realizado demasiadas solicitudes en poco tiempo. Por favor, espera unos minutos antes de intentar nuevamente. Esto ayuda a mantener el rendimiento del sistema.')
