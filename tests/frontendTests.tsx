import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MyAsyncComponent from './MyAsyncComponent';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const API_URL = process.env.API_API_URL ?? 'http://localhost:3000';

interface User {
  id: number;
  name: string;
}

describe('MyAsyncComponent', () => {
  it('fetches and displays data successfully', async () => {
    const mockUserData: { data: User[] } = {
      data: [{ id: 1, name: 'John Doe' }]
    };
    
    mockedAxios.get.mockResolvedValue(mockUserData);

    render(<MyAsyncComponent />);

    await waitFor(() => 
      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/data`)
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles button clicks correctly', async () => {
    const onClickMock = jest.fn();
    
    render(<button onClick={onClickMock}>Click me!</button>);

    fireEvent.click(screen.getByText('Click me!'));
    
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('displays an error message on fetch failure', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Failed to fetch'));

    render(<MyAsyncComponent />);

    await waitFor(() => 
      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/data`)
    );

    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });
});