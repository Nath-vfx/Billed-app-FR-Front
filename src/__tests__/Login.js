/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";
import { fireEvent, screen } from "@testing-library/dom";

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-employee");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

describe("Given that I am a user on login page and login fails", () => {
  describe("When I submit employee form and login fails", () => {
    test("Then createUser should be called", async () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: inputData.password } });

      const form = screen.getByTestId("form-employee");

      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const mockStore = {
        login: jest.fn().mockRejectedValue(new Error("Login failed")),
        users: jest.fn(() => ({
          create: jest.fn().mockResolvedValue({})
        }))
      };

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store: mockStore,
      });

      const createUserSpy = jest.spyOn(login, 'createUser');
      createUserSpy.mockResolvedValue({});

      fireEvent.submit(form);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(createUserSpy).toHaveBeenCalledWith({
        type: "Employee",
        email: inputData.email,
        password: inputData.password,
        status: "connected",
      });
    });
  });

  describe("When I submit admin form and login fails", () => {
    test("Then createUser should be called", async () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "admin@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: inputData.password } });

      const form = screen.getByTestId("form-admin");

      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const mockStore = {
        login: jest.fn().mockRejectedValue(new Error("Login failed")),
        users: jest.fn(() => ({
          create: jest.fn().mockResolvedValue({})
        }))
      };

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store: mockStore,
      });

      const createUserSpy = jest.spyOn(login, 'createUser');
      createUserSpy.mockResolvedValue({});

      fireEvent.submit(form);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(createUserSpy).toHaveBeenCalledWith({
        type: "Admin",
        email: inputData.email,
        password: inputData.password,
        status: "connected",
      });
    });
  });
});

describe("Given that I want to test login and createUser methods", () => {
  beforeEach(() => {
    document.body.innerHTML = LoginUI();
  });

  describe("When login method is called with store", () => {
    test("Then it should call store.login and set jwt in localStorage", async () => {
      const mockStore = {
        login: jest.fn().mockResolvedValue({ jwt: "mock-jwt-token" })
      };

      const login = new Login({
        document: document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: "",
        store: mockStore,
      });

      Object.defineProperty(window, "localStorage", {
        value: {
          setItem: jest.fn(),
        },
        writable: true,
      });

      const user = { email: "test@email.com", password: "password" };
      await login.login(user);

      expect(mockStore.login).toHaveBeenCalledWith(JSON.stringify({
        email: user.email,
        password: user.password,
      }));
      expect(localStorage.setItem).toHaveBeenCalledWith('jwt', 'mock-jwt-token');
    });
  });

  describe("When login method is called without store", () => {
    test("Then it should return null", () => {
      const login = new Login({
        document: document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: "",
        store: null,
      });

      const user = { email: "test@email.com", password: "password" };
      const result = login.login(user);

      expect(result).toBeNull();
    });
  });

  describe("When createUser method is called with store", () => {
    test("Then it should create user and call login", async () => {
      const createMock = jest.fn().mockResolvedValue({});
      const mockStore = {
        users: jest.fn(() => ({
          create: createMock
        })),
        login: jest.fn().mockResolvedValue({ jwt: "mock-jwt-token" })
      };

      const login = new Login({
        document: document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: "",
        store: mockStore,
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const loginSpy = jest.spyOn(login, 'login').mockResolvedValue({});

      const user = { 
        type: "Employee",
        email: "test@email.com", 
        password: "password" 
      };

      await login.createUser(user);

      expect(createMock).toHaveBeenCalledWith({
        data: JSON.stringify({
          type: user.type,
          name: user.email.split('@')[0],
          email: user.email,
          password: user.password,
        })
      });
      expect(consoleSpy).toHaveBeenCalledWith(`User with ${user.email} is created`);
      expect(loginSpy).toHaveBeenCalledWith(user);

      consoleSpy.mockRestore();
    });
  });

  describe("When createUser method is called without store", () => {
    test("Then it should return null", () => {
      const login = new Login({
        document: document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: "",
        store: null,
      });

      const user = { email: "test@email.com", password: "password" };
      const result = login.createUser(user);

      expect(result).toBeNull();
    });
  });
});

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-admin");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy();
    });
  });
});
