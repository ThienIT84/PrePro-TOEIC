---
name: prepro-ui-components
description: >-
  Hướng dẫn phát triển UI components trong dự án PrePro-TOEIC.
  Sử dụng skill này khi cần tạo/sửa giao diện, form, table,
  dialog, hoặc bất kỳ UI element nào theo chuẩn dự án.
---

# UI Component Development — PrePro-TOEIC

## UI Stack
- **shadcn/ui** — Component library (Radix UI + Tailwind CSS)
- **Tailwind CSS** — Utility-first CSS
- **Lucide React** — Icon library
- **Recharts** — Data visualization
- **react-hook-form** + **zod** — Form handling + validation
- **Sonner** + **useToast** — Notifications

## shadcn/ui Components có sẵn

Import từ `@/components/ui/`:

### Layout & Container
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- `Separator`, `ScrollArea`, `Collapsible`
- `Sheet`, `Drawer`, `Sidebar`, `ResizablePanel`

### Form & Input
- `Button` (variants: default, destructive, outline, secondary, ghost, link)
- `Input`, `Textarea`, `Label`
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `Checkbox`, `RadioGroup`, `Switch`, `Slider`
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- `Calendar`, `DatePicker`

### Feedback & Overlay
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger`
- `AlertDialog` — Confirmation dialogs
- `Toast`, `useToast()` — Notification toasts
- `Sonner` — Alternative toast system
- `Tooltip`, `Popover`, `HoverCard`
- `Alert`, `AlertDescription`
- `Progress`, `Skeleton`
- `Badge`

### Navigation
- `DropdownMenu`, `ContextMenu`, `Menubar`
- `NavigationMenu`, `Breadcrumb`
- `Pagination`
- `Command` (command palette)

### Data Display
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `Avatar`, `AspectRatio`
- `Carousel`

## Common Patterns

### Loading State
```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <span className="ml-2 text-muted-foreground">Loading...</span>
    </div>
  );
}
```

### Toast Notification
```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();
toast({
  title: 'Thành công!',
  description: 'Dữ liệu đã được lưu.',
});

// Error toast
toast({
  title: 'Lỗi',
  description: error.message,
  variant: 'destructive',
});
```

### Form với react-hook-form + zod
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Tiêu đề không được trống'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { title: '', difficulty: 'medium' },
});
```

### Confirmation Dialog
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Xóa</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
      <AlertDialogDescription>
        Hành động này không thể hoàn tác.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Hủy</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Tailwind CSS Conventions

### Color Tokens (shadcn/ui)
- `bg-background`, `text-foreground` — Main colors
- `bg-primary`, `text-primary-foreground` — Primary actions
- `bg-destructive`, `text-destructive` — Error/delete
- `bg-muted`, `text-muted-foreground` — Secondary text
- `bg-accent` — Hover states
- `border-border` — Borders

### Spacing
- Container padding: `p-4` hoặc `p-6`
- Card gaps: `space-y-4`
- Section margins: `mb-6`

### Responsive
- Mobile-first: `className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"`
- Hide on mobile: `className="hidden md:block"`
- Hook: `import { useIsMobile } from '@/hooks/use-mobile'`

## Tham khảo
- [Component Catalog](./references/component-catalog.md)
