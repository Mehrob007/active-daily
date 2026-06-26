#!/bin/bash
BASE_DIR="/home/sk/dev/active-daily/src/app"

create_page() {
  local path=$1
  local title=$2
  
  cat << TSX > "$BASE_DIR/$path/page.tsx"
import React from 'react';
import { UnderConstructionPage } from '@/features/shared/UnderConstructionPage';

export default function Page() {
  return <UnderConstructionPage title="$title" subtitle="Структурная страница для будущей реализации" />;
}
TSX
}

create_page "worker/cards" "Карты работников"
create_page "worker/credits" "Кредиты работников"
create_page "worker/reports" "Отчеты работников"
create_page "chairman/reports" "Отчеты Председателя"
create_page "chairman/knowledge-base" "База знаний Председателя"
create_page "director/reports" "Отчеты Директора"
create_page "director/knowledge-base" "База знаний Директора"
create_page "card-balance" "Баланс карт"

echo "Pages created successfully!"
