import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Building2, KeyRound } from 'lucide-react';
import AuthLayout from '@/shared/components/layout/AuthLayout';
import FormField from '@/shared/components/form/FormField';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import useAuthStore from './store';

const STORAGE_APT_NAME = 'parkingcare-login-apartment-name';
const STORAGE_SAVE = 'parkingcare-login-save-name';

const loginSchema = z.object({
  aptName: z.string().min(1, '아파트 이름을 입력하세요.'),
  finNo: z
    .string()
    .regex(/^[0-9]{6}$/, 'FIN 코드는 6자리 숫자여야 합니다.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  const { savedName, savedFlag } = useMemo(() => {
    const flag = localStorage.getItem(STORAGE_SAVE) === 'true';
    const name = localStorage.getItem(STORAGE_APT_NAME) ?? '';
    return { savedName: name, savedFlag: flag };
  }, []);

  const [saveName, setSaveName] = useState(savedFlag);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      aptName: savedFlag ? savedName : '',
      finNo: '123456',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    console.log('[v0] Form submitted:', values);
    if (saveName) {
      localStorage.setItem(STORAGE_APT_NAME, values.aptName);
      localStorage.setItem(STORAGE_SAVE, 'true');
    } else {
      localStorage.removeItem(STORAGE_APT_NAME);
      localStorage.setItem(STORAGE_SAVE, 'false');
    }
    console.log('[v0] Calling login...');
    await login(values.aptName, values.finNo);
    console.log('[v0] Login function returned');
  };

  useEffect(() => {
    console.log('[v0] Auth state changed:', { isAuthenticated });
    if (isAuthenticated) {
      console.log('[v0] Navigating to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout title="관리자 로그인" subtitle="아파트 주차 관리 시스템에 로그인하세요.">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField id="aptName" label="아파트 이름" required error={errors.aptName?.message}>
          <Input
            id="aptName"
            icon={<Building2 size={14} />}
            placeholder="아파트 이름을 입력하세요"
            error={!!errors.aptName}
            {...register('aptName')}
          />
        </FormField>
        <FormField id="finNo" label="FIN 코드" required error={errors.finNo?.message}>
          <Input
            id="finNo"
            type="password"
            icon={<KeyRound size={14} />}
            placeholder="6자리 숫자를 입력하세요"
            error={!!errors.finNo}
            {...register('finNo')}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={saveName}
            onChange={(event) => setSaveName(event.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          입력한 아파트 이름 저장
        </label>
        <Button type="submit" loading={isLoading} size="lg" className="w-full">
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
