import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/banking';
import { absService } from '../../services/abs-service';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { FileText, Eye } from 'lucide-react';

interface DocumentsModalProps {
  inn: string | null;
  onClose: () => void;
}

export const DocumentsModal: React.FC<DocumentsModalProps> = ({ inn, onClose }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (inn) {
      setIsLoading(true);
      absService.getClientDocumentsByINN(inn)
        .then(setData)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [inn]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'title', header: 'Название' },
    { accessorKey: 'type', header: 'Тип' },
    { accessorKey: 'createdAt', header: 'Дата' },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" onClick={() => window.open(row.original.url, '_blank')}>
          <Eye className="size-4 mr-2" /> Просмотр
        </Button>
      )
    }
  ];

  return (
    <Dialog open={!!inn} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Документы клиента (ИНН: {inn})</DialogTitle>
        </DialogHeader>
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          pageSize={10}
        />
      </DialogContent>
    </Dialog>
  );
};
