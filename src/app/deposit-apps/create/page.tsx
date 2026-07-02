import React from 'react';
import { DepositApplicationForm } from '@/features/deposit-apps/create/DepositApplicationForm';

export default function Page() {
  return <DepositApplicationForm />;
}

const {"success":true,"message":"Site settings loaded successfully.","data":{"contact":[{"key":"contact_email","value":"info@example.com","type":"text","group":"contact"},{"key":"contact_phone","value":"+992 00 000 00 00","type":"text","group":"contact"}],"general":[{"key":"site_description","value":"Official public website","type":"text","group":"general"},{"key":"site_name","value":"Public Website","type":"text","group":"general"}],"social":[{"key":"facebook_url","value":null,"type":"text","group":"social"},{"key":"instagram_url","value":null,"type":"text","group":"social"}]}}