import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateCourseUnit, useUpdateCourseUnit, useAcademicPrograms } from '@/hooks/use-course-units';
import { CourseUnit, CreateCourseUnitInput, UpdateCourseUnitInput } from '@/types/course-unit';
import { toast } from 'sonner';

const courseUnitSchema = z.object({
  academicProgramId: z.string().min(1, 'Le programme académique est requis'),
  code: z.string().min(1, 'Le code est requis').max(20, 'Le code ne peut pas dépasser 20 caractères'),
  name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  semesterNumber: z.number().min(1, 'Le numéro de semestre doit être au moins 1').max(12, 'Le numéro de semestre ne peut pas dépasser 12'),
  credits: z.number().min(1, 'Le nombre de crédits doit être au moins 1').max(30, 'Le nombre de crédits ne peut pas dépasser 30'),
  type: z.enum(['OBLIGATOIRE', 'OPTIONNEL'], {
    required_error: 'Le type est requis',
  }),
  isActive: z.boolean().default(true),
});

type CourseUnitFormData = z.infer<typeof courseUnitSchema>;

interface CourseUnitFormProps {
  courseUnit?: CourseUnit;
  onSuccess?: () => void;
}

const CourseUnitForm: React.FC<CourseUnitFormProps> = ({ courseUnit, onSuccess }) => {
  const router = useRouter();
  const createMutation = useCreateCourseUnit();
  const updateMutation = useUpdateCourseUnit();
  const { data: academicPrograms } = useAcademicPrograms();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CourseUnitFormData>({
    resolver: zodResolver(courseUnitSchema),
    defaultValues: courseUnit ? {
      academicProgramId: courseUnit.academicProgramId,
      code: courseUnit.code,
      name: courseUnit.name,
      semesterNumber: courseUnit.semesterNumber,
      credits: courseUnit.credits,
      type: courseUnit.type,
      isActive: courseUnit.isActive,
    } : {
      isActive: true,
    },
  });

  const watchedType = watch('type');
  const watchedIsActive = watch('isActive');

  const onSubmit = async (data: CourseUnitFormData) => {
    try {
      if (courseUnit) {
        // Update existing course unit
        const updateData: UpdateCourseUnitInput = {
          id: courseUnit.id,
          ...data,
        };
        await updateMutation.mutateAsync(updateData);
        toast.success('Unité d\'enseignement mise à jour avec succès');
      } else {
        // Create new course unit
        const createData: CreateCourseUnitInput = data;
        await createMutation.mutateAsync(createData);
        toast.success('Unité d\'enseignement créée avec succès');
        router.push('/course-units');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(courseUnit ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {courseUnit ? 'Modifier l\'Unité d\'Enseignement' : 'Créer une Unité d\'Enseignement'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicProgramId">Programme Académique *</Label>
              <Select
                value={watch('academicProgramId')}
                onValueChange={(value: string) => setValue('academicProgramId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un programme" />
                </SelectTrigger>
                <SelectContent>
                  {academicPrograms?.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.academicProgramId && (
                <p className="text-sm text-red-600">{errors.academicProgramId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="Ex: UE001"
              />
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nom de l'unité d'enseignement"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semesterNumber">Semestre *</Label>
              <Input
                id="semesterNumber"
                type="number"
                min="1"
                max="12"
                {...register('semesterNumber', { valueAsNumber: true })}
                placeholder="1"
              />
              {errors.semesterNumber && (
                <p className="text-sm text-red-600">{errors.semesterNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="credits">Crédits *</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="30"
                {...register('credits', { valueAsNumber: true })}
                placeholder="3"
              />
              {errors.credits && (
                <p className="text-sm text-red-600">{errors.credits.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={watchedType}
                onValueChange={(value: 'OBLIGATOIRE' | 'OPTIONNEL') => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OBLIGATOIRE">Obligatoire</SelectItem>
                  <SelectItem value="OPTIONNEL">Optionnel</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={watchedIsActive}
              onCheckedChange={(checked: boolean) => setValue('isActive', !!checked)}
            />
            <Label htmlFor="isActive">Unité active</Label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : (courseUnit ? 'Mettre à jour' : 'Créer')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CourseUnitForm;