// contact.test.js
import Contact from "@/components/contact";
import { render, screen } from "@testing-library/react";

const mockContactData = {
  email: "shyleshstylo@gmail.com",
  phone: "+91 7760043578",
  LinkedIn: "https://www.linkedin.com/in/s-shylesh/",
};

describe("Contact Component", () => {
  it("renders without crashing", () => {
    render(<Contact contact={mockContactData} />);
    expect(screen.getByText("Contact Me")).toBeInTheDocument();
  });

  it("displays email, phone, and LinkedIn links", () => {
    render(<Contact contact={mockContactData} />);
    const emailLink = screen.getByTestId("email-link");
    const phoneLink = screen.getByTestId("phone-link");
    const linkedInLink = screen.getByTestId("linkedin-link");

    expect(emailLink).toHaveAttribute(
      "href",
      `mailto:${mockContactData.email}`
    );
    expect(phoneLink).toHaveAttribute("href", `tel:${mockContactData.phone}`);
    expect(linkedInLink).toHaveAttribute("href", mockContactData.LinkedIn);
  });
});
