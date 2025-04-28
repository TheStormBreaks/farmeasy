// src/components/ProductManagement.tsx
'use client';

import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Edit, Loader2, PackagePlus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Product } from '@/types';

// Schema for Add/Edit Product Form
const productFormSchema = z.object({
    name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }).max(100),
    description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(500),
    price: z.preprocess(
        (val) => parseFloat(z.string().parse(val)), // Convert string input to number
        z.number({ invalid_type_error: 'Price must be a number.' }).positive({ message: 'Price must be positive.' })
    ),
    availableQuantity: z.preprocess(
        (val) => parseInt(z.string().parse(val), 10), // Convert string input to integer
        z.number({ invalid_type_error: 'Quantity must be a number.' }).int().nonnegative({ message: 'Quantity cannot be negative.' })
    ),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProductManagement() {
    const { userId } = useAuth(); // Get the supplier's ID
    const { products, isLoading, error, addProduct, updateProduct, deleteProduct } = useProducts(userId || undefined); // Pass supplierId to filter
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            availableQuantity: 0,
        },
    });

    // Pre-fill form when editing
    React.useEffect(() => {
        if (editingProduct) {
            form.reset({
                name: editingProduct.name,
                description: editingProduct.description,
                price: editingProduct.price,
                availableQuantity: editingProduct.availableQuantity,
            });
             setIsFormOpen(true); // Open dialog when editingProduct is set
        } else {
            form.reset(); // Reset form when closing or adding new
        }
    }, [editingProduct, form]);

    const handleFormSubmit = async (values: ProductFormValues) => {
        if (!userId) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not identified.' });
            return;
        }
        setIsSubmitting(true);
        try {
            if (editingProduct) {
                // Update existing product
                await updateProduct(editingProduct.id, values);
                toast({ title: 'Success', description: 'Product updated successfully.' });
            } else {
                // Add new product
                await addProduct({ ...values, supplierId: userId });
                toast({ title: 'Success', description: 'Product added successfully.' });
            }
            setEditingProduct(null); // Reset editing state
            setIsFormOpen(false); // Close dialog
            form.reset(); // Reset form fields
        } catch (err) {
            console.error("Failed to save product:", err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save product. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

     const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            await deleteProduct(id);
            toast({ title: 'Success', description: 'Product deleted successfully.' });
        } catch (err) {
            console.error("Failed to delete product:", err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete product. Please try again.' });
        } finally {
            setIsDeleting(null);
        }
    };

    const openAddForm = () => {
        setEditingProduct(null);
        form.reset(); // Ensure form is clear for adding
        setIsFormOpen(true);
    };

    const openEditForm = (product: Product) => {
        setEditingProduct(product);
        // Form reset is handled by the useEffect hook
    };

     const onDialogClose = (open: boolean) => {
        if (!open) {
             setEditingProduct(null); // Clear editing state when dialog closes
             form.reset();
        }
        setIsFormOpen(open);
     }


    const renderSkeleton = () => (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
            <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
            <TableCell><Skeleton className="h-4 w-1/4" /></TableCell>
            <TableCell><Skeleton className="h-4 w-1/4" /></TableCell>
            <TableCell className="text-right space-x-2">
                <Skeleton className="h-8 w-8 inline-block" />
                <Skeleton className="h-8 w-8 inline-block" />
            </TableCell>
        </TableRow>
    );

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Your Products</CardTitle>
                        <CardDescription>Manage the products you offer for sale.</CardDescription>
                    </div>
                     <Dialog open={isFormOpen} onOpenChange={onDialogClose}>
                        <DialogTrigger asChild>
                             <Button onClick={openAddForm}><PackagePlus className="mr-2 h-4 w-4" /> Add Product</Button>
                        </DialogTrigger>
                         <DialogContent className="sm:max-w-[525px]">
                            <DialogHeader>
                                 <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                 <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Organic Fertilizer" {...field} disabled={isSubmitting} />
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
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                 <Textarea placeholder="Detailed description of the product..." {...field} disabled={isSubmitting} rows={4} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Price (per unit)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="0.00" {...field} disabled={isSubmitting} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name="availableQuantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Available Quantity</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" {...field} disabled={isSubmitting} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                     <DialogFooter>
                                        <DialogClose asChild>
                                             <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                                        </DialogClose>
                                         <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            {editingProduct ? 'Save Changes' : 'Add Product'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                         </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                 {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            Failed to load products: {error.message}. Please try refreshing.
                        </AlertDescription>
                    </Alert>
                 )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {isLoading && products.length === 0 ? (
                             <>
                                {renderSkeleton()}
                                {renderSkeleton()}
                                {renderSkeleton()}
                             </>
                         ) : !isLoading && products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No products found. Click "Add Product" to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{product.description}</TableCell>
                                    <TableCell>${product.price.toFixed(2)}</TableCell>
                                    <TableCell>{product.availableQuantity}</TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEditForm(product)} aria-label="Edit product">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(product.id)}
                                            disabled={isDeleting === product.id}
                                            aria-label="Delete product"
                                            className="text-destructive hover:text-destructive/80"
                                        >
                                            {isDeleting === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
