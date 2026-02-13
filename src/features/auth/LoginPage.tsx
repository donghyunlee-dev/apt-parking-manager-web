import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import AuthLayout from '@/shared/components/layout/AuthLayout';
import FormField from '@/shared/components/form/FormField';
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
    if (saveName) {
      localStorage.setItem(STORAGE_APT_NAME, values.aptName);
      localStorage.setItem(STORAGE_SAVE, 'true');
    } else {
      localStorage.removeItem(STORAGE_APT_NAME);
      localStorage.setItem(STORAGE_SAVE, 'false');
    }
    await login(values.aptName, values.finNo);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout title="관리자 로그인">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          id="aptName"
          label="아파트 이름"
          required
          error={errors.aptName?.message}
        >
          <input
            id="aptName"
            className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            {...register('aptName')}
          />
        </FormField>
        <FormField id="finNo" label="FIN 코드" required error={errors.finNo?.message}>
          <input
            id="finNo"
            type="password"
            className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            {...register('finNo')}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={saveName}
            onChange={(event) => setSaveName(event.target.checked)}
          />
          입력한 아파트 이름 저장
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="h-10 rounded-md bg-slate-900 text-sm font-semibold text-white disabled:opacity-60 dark:bg-emerald-400 dark:text-slate-900"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
