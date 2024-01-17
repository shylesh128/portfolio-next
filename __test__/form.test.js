import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import ContactForm from "@/components/Message";

jest.mock("axios");

describe("ContactForm Component", () => {
  it("renders without crashing", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText("Name:")).toBeInTheDocument();
    expect(screen.getByLabelText("Email:")).toBeInTheDocument();
    expect(screen.getByLabelText("Message:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("updates form data when input fields change", () => {
    render(<ContactForm />);
    const nameInput = screen.getByLabelText("Name:");
    const emailInput = screen.getByLabelText("Email:");
    const messageInput = screen.getByLabelText("Message:");

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(messageInput, {
      target: { value: "Hello, this is a test message." },
    });

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("john@example.com");
    expect(messageInput).toHaveValue("Hello, this is a test message.");
  });

  it("submits form data successfully", async () => {
    axios.post.mockResolvedValueOnce({}); // Mock a successful response
    render(<ContactForm />);
    const nameInput = screen.getByLabelText("Name:");
    const emailInput = screen.getByLabelText("Email:");
    const messageInput = screen.getByLabelText("Message:");
    const submitButton = screen.getByRole("button", { name: "Submit" });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(messageInput, {
      target: { value: "Hello, this is a test message." },
    });

    fireEvent.click(submitButton);

    expect(submitButton).toHaveTextContent("Loading....");

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "https://painhub.onrender.com/api/feedback",
        {
          name: "John Doe",
          email: "john@example.com",
          message: "Hello, this is a test message.",
        }
      );
    });

    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
