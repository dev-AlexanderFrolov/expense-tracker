"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { TransactionType } from "@expense-tracker/shared";
import { categoryKeys, getCategories } from "@/entities/category";
import { ApiError } from "@/shared/api/client";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useCreateTransaction } from "../model/use-create-transaction";
import { createTransactionSchema, type CreateTransactionFormValues } from "../model/schema";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface CreateTransactionDialogProps {
  onCreated?: () => void;
}

export function CreateTransactionDialog({ onCreated }: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending, error, reset } = useCreateTransaction();
  const categoriesQuery = useQuery({ queryKey: categoryKeys.list(), queryFn: getCategories });

  const form = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: undefined,
      type: TransactionType.EXPENSE,
      categoryId: "",
      date: today(),
      description: "",
    },
  });

  const categories = categoriesQuery.data ?? [];
  const hasCategories = categories.length > 0;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      form.reset({
        amount: undefined,
        type: TransactionType.EXPENSE,
        categoryId: "",
        date: today(),
        description: "",
      });
      reset();
    }
  };

  const onSubmit = (values: CreateTransactionFormValues) => {
    mutate(
      {
        amount: values.amount,
        type: values.type,
        categoryId: values.categoryId,
        date: new Date(`${values.date}T00:00:00`).toISOString(),
        description: values.description?.trim() ? values.description.trim() : undefined,
      },
      {
        onSuccess: () => {
          handleOpenChange(false);
          onCreated?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Добавить транзакцию
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая транзакция</DialogTitle>
          <DialogDescription>Заполните данные о доходе или расходе.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error instanceof ApiError ? error.message : "Не удалось создать транзакцию"}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TransactionType.EXPENSE}>Расход</SelectItem>
                      <SelectItem value={TransactionType.INCOME}>Доход</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сумма</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={Number.isFinite(field.value) ? field.value : ""}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!hasCategories}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!hasCategories && (
                    <p className="text-xs text-muted-foreground">
                      Сначала создайте категорию в разделе «Категории».
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Input placeholder="Необязательно" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending || !hasCategories}>
                {isPending ? "Сохраняем..." : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
