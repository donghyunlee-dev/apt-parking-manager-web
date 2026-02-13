import { render, screen } from '@testing-library/react';
import FormField from '@/shared/components/form/FormField';

it('renders label and error', () => {
  render(
    <FormField id="name" label="이름" error="필수 입력">
      <input id="name" />
    </FormField>,
  );

  expect(screen.getByText('이름')).toBeInTheDocument();
  expect(screen.getByText('필수 입력')).toBeInTheDocument();
});
