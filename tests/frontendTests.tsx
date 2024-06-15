import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MyAsyncComponent from './MyAsyncComponent';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Improved environment variable handling
const API_URL = process.env.API_URL || 'http://localhost:3000';

// TypeScript Definitions for our mock data
interface User {
  id: number;
  name: string;
}

describe('MyAsyncComponent tests', () => {
  it('Should fetch data successfully and display it', async () => {
    const responseData: { data: User[] } = { data: [{ id: 1, name: 'John Doe' }] };
    mockedAxios.get.mockResolvedValue(responseData);

    render(<MyAsyncComponent />);

    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/data`));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('Should call the onClick handler when button is clicked', async () => {
    const onClickMock = jest.fn();
    render(<button onClick={onClickMock}>Click me!</button>);

    fireEvent.click(screen.getByText('Click me!'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('Should display error message when data fetching fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Failed to fetch'));

    render(<MyAsyncComponent />);

    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/data`));

    // Ensure you have a defined way to show errors in MyAsyncComponent
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  // Add more tests here for additional functionality or edge conditions
});