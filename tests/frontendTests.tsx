import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyAsync, { } from './MyAsyncComponent';
import axios from 'axios';

jest.mock('axios');

const getEnvVariables = () => ({
  API_URL: process.env.API_URL || 'http://localhost:3000',
});

describe('MyAsyncComponent tests', () => {
  it('Should fetch data successfully and display it', async () => {
    const responseData = { data: [{ id: 1, name: 'John Doe' }] };
    axios.get.mockResolvedValue(responseData);
    const { API_URL } = getEnvVariables();

    render(<MyAsyncComponent />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`${API_URL}/data`));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('Should call the onClick handler when button is clicked', async () => {
    const onClickMock = jest.fn();
    render(<button onClick={onClickMock}>Click me!</button>);

    fireEvent.click(screen.getByText('Click me!'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('Should display error message when data fetching fails', async () => {
    axios.get.mockRejectedValue(new Error('Failed to fetch'));
    const { API_URL } = getEnvVariables();

    render(<MyAsyncComponent />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`${API_URL}/data`));

    const errorMessage = screen.queryByText(/error/i);
    expect(errorMessage).toBeInTheDocument();
  });
});