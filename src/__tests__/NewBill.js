/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import store from "../app/Store.js"
import {fireEvent} from "@testing-library/dom";
import fetchMock from 'jest-fetch-mock';
import {render} from "express/lib/application.js";

fetchMock.enableMocks();

describe("Given I am connected as an employee", () => {
  let onNavigate
  beforeEach(() => {
    const html = NewBillUI()
    document.body.innerHTML = html
    onNavigate = jest.fn()
  })

  describe("When I am on NewBill Page", () => {
    test("Then, selector should return a value", () => {
      const expenseName = screen.getByTestId("expense-name");
      expect(expenseName.value).not.toBe(null)
    })

    test("Then, I decide to take a file from my computer", () => {
      const file = screen.getByTestId("file");
      expect(file.value).not.toBe(null)
      expect(file.accept).toBe("image/png, image/jpeg, image/jpg");
    })
  })
  describe('NewBill', () => {
    it('should submit a new bill', async () => {
      const newBill = new NewBill({ document, onNavigate, store, localStorage });
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

      const handleSubmit = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
    });
    it('should form validation', async () => {
      const bill ={
        email: "a@a.fr",
        type: "Employee",
        status: "pending",
        name: "test",
        date: "2021-01-01",
        amount: 100,
        vat: 20,
        pct: 20,
        commentary: "test",
        fileUrl: "https://picsum.photos/200/300",
        fileName: "test.png",
      };

      expect(bill.email).toBe("a@a.fr")
      expect(bill.type).toBe("Employee")
      expect(bill.status).toBe("pending")
      expect(bill.name).toBe("test")
      expect(bill.date).toBe("2021-01-01")
      expect(bill.amount).toBe(100)
      expect(bill.vat).toBe(20)
      expect(bill.pct).toBe(20)
      expect(bill.commentary).toBe("test")
      expect(bill.fileUrl).toBe("https://picsum.photos/200/300")
      expect(bill.fileName).toBe("test.png")
    })
  });
  describe('handleChangeFile', () => {
    it('should handle file change with valid extension', async () => {
      const newBill = new NewBill({ document, onNavigate, store, localStorage });
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a.fr" }));

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const file = screen.getByTestId("file");
      
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [testFile]
        }
      });
      
      expect(handleChangeFile).toHaveBeenCalled();
    });

    it('should reject file with invalid extension and show error message', () => {
      const newBill = new NewBill({ document, onNavigate, store, localStorage });
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a.fr" }));

      const file = screen.getByTestId("file");
      const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      Object.defineProperty(file, 'files', {
        value: [testFile],
        writable: false,
      });

      const mockEvent = {
        preventDefault: jest.fn(),
        target: { value: 'C:\\fakepath\\test.pdf' }
      };

      newBill.handleChangeFile(mockEvent);
      
      const errorMessage = document.querySelector('#file-error-message');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toBe('Seuls les fichiers jpg, jpeg et png sont acceptés');
    });

    it('should accept png files', () => {
      const newBill = new NewBill({ document, onNavigate, store, localStorage });
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a.fr" }));

      const file = screen.getByTestId("file");
      const testFile = new File(['test'], 'test.png', { type: 'image/png' });
      
      Object.defineProperty(file, 'files', {
        value: [testFile],
        writable: false,
      });

      const mockEvent = {
        preventDefault: jest.fn(),
        target: { value: 'C:\\fakepath\\test.png' }
      };

      newBill.handleChangeFile(mockEvent);
      
      const errorMessage = document.querySelector('#file-error-message');
      expect(errorMessage).toBeFalsy();
    });
  });
})