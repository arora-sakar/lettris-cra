import { render, screen } from '@testing-library/react';
import Lettris from './Lettris';

test('renders learn react link', () => {
  render(<Lettris />);
  const linkElement = screen.getByText(/Lettris! The ultimate game./i);
  expect(linkElement).toBeInTheDocument();
});
