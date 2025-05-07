// App.test.js
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders the app header', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const headerElement = screen.getByText(/World of Web games/i);
  expect(headerElement).toBeInTheDocument();
  
  const linkElement = screen.getByAltText(/Play Lettris/i);
  expect(linkElement).toBeInTheDocument();
});

// Lettris.test.js
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Lettris from './Lettris';

// Mock localStorage
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    },
    writable: true
  });
});

test('renders the game title', () => {
  render(<Lettris />);
  const titleElement = screen.getByText(/Lettris/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders game controls', () => {
  render(<Lettris />);
  
  // Check for instruction button
  const instButton = screen.getByText('i');
  expect(instButton).toBeInTheDocument();
  
  // Check for stat button
  const statButton = screen.getByText('...');
  expect(statButton).toBeInTheDocument();
  
  // Check for start button
  const startButton = screen.getByText('START');
  expect(startButton).toBeInTheDocument();
  
  // Check for back button
  const backButton = screen.getByText('BACK');
  expect(backButton).toBeInTheDocument();
});

test('clicking instructions button shows instruction popup', async () => {
  render(<Lettris />);
  const user = userEvent.setup();
  
  // Instruction button
  const instButton = screen.getByText('i');
  
  // Click the instruction button
  await user.click(instButton);
  
  // Check if instruction popup is visible
  const howToPlayHeading = screen.getByText('HOW TO PLAY');
  expect(howToPlayHeading).toBeInTheDocument();
});