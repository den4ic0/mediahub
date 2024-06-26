import React, { useEffect, useState } from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import YourComponent from './YourComponent';
import YourInlineEditComponent from './YourInlineEditComponent';
import '@testing-library/jest-dom/extend-expect';

process.env.REACT_APP_YOUR_API_URL = 'https://your-api.example.com';

let mock = new MockAdapter(axios);

async function fetchAndUpdateData(url, setData, setError) {
  try {
    const response = await axios.get(url);
    setData(response.data);
  } catch (error) {
    setError(true);
  }
}

const YourComponentEnhanced = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAndUpdateData(process.env.REACT_APP_YOUR_API_URL, setData, setError);
  }, []);

  if (error) return <div>Error fetching data</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>{data}</div>
  );
};

describe('YourComponent', () => {
    beforeAll(() => {
        mock = new MockAdapter(axios);
    });

    it('loads and displays data fetched from an API', async () => {
        const testData = { data: 'Sample data from API' };
        
        mock.onGet(process.env.REACT_APP_YOUR_API_URL).reply(200, testData);
        
        render(<YourComponentEnhanced />);
        
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
        
        await waitFor(() => expect(screen.getByText(/Sample data from API/)).toBeInTheDocument());
    });

    it('responds to user clicks in inline edit component', async () => {
        render(<YourInlineEditComponent />);
        const editButton = screen.getByRole('button', { name: /edit/i });
        
        userEvent.click(editButton);
        
        await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
    });

    it('allows updating data through inline edit component', async () => {
        const updatedValue = "Updated content";

        render(<YourInlineEditComponent />);
        mock.onPost(process.env.REACT_APP_YOUR_API_URL).reply(config => {
            expect(JSON.parse(config.data)).toEqual({data: updatedValue});
            return [200, { data: "Updated content" }];
        });

        const input = screen.getByRole('textbox');
        userEvent.clear(input);
        userEvent.type(input, updated_value);
        userEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => expect(screen.getByText(updatedValue)).toBeInTheDocument());
    });

    it('displays an error message when the API call fails', async () => {
        mock.onGet(process.env.REACT_APP_YOUR_API_URL).networkError();

        render(<YourComponentEnhanced />);
        
        await waitFor(() => expect(screen.getByText(/Error fetching data/)).toBeInTheDocument());
    });

    afterAll(() => {
        mock.restore();
    });
});