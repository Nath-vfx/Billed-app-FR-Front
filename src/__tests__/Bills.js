  /**
   * @jest-environment jsdom
   */

  import {screen, waitFor} from "@testing-library/dom"
  import BillsUI from "../views/BillsUI.js"
  import Bills from "../containers/Bills.js";
  import { bills } from "../fixtures/bills.js"
  import { ROUTES_PATH} from "../constants/routes.js";
  import {localStorageMock} from "../__mocks__/localStorage.js";
  import $ from 'jquery';

  import router from "../app/Router.js";
  import NewBill from "../containers/NewBill.js";

  describe("Given I am on Bills Page", () => {
    describe("As an employee", () => {
      test("Then bill icon in vertical layout should be highlighted", async () => {

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() => screen.getByTestId('icon-window'))
        const windowIcon = screen.getByTestId('icon-window')
        //to-do write expect expression
        expect(windowIcon.getAttribute("class")).toContain('active-icon')

      })
      test("Then bills should be ordered from earliest to latest", () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
        const antiChrono = (a, b) => ((a > b) ? -1 : 1)
        const datesSorted = [...dates].sort(antiChrono)
        expect(dates).toEqual(datesSorted)
      })

      describe("When handling bills", () => {
        it("should navigate to NewBill page when clicking new bill button", () => {
          const onNavigate = jest.fn();
          const store = {}; // mock store object
          const localStorage = {}; // mock localStorage object
          const document = {
            querySelector: jest.fn(() => {
              return {
                addEventListener: jest.fn(),
                getAttribute: jest.fn(),
              };
            }),
            querySelectorAll: jest.fn(() => {
              return [];
            }),
          };
          const bills = new Bills({ document, onNavigate, store, localStorage });
          bills.handleClickNewBill();
          expect(onNavigate).toHaveBeenCalledTimes(1);
          expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
        });

        it("should fetch bills list from store with correct format", async () => {
          const store = { bills: () => ({ list: jest.fn().mockResolvedValue([]) }) };
          const document = {
            querySelector: jest.fn(() => {
              return {
                addEventListener: jest.fn(),
                getAttribute: jest.fn(),
              };
            }),
            querySelectorAll: jest.fn(() => {
              return [];
            }),
          };
          const billsInstance = new Bills({ document, store });
          const result = await billsInstance.getBills();
          expect(Array.isArray(result)).toBe(true);
        });

        it("should properly format dates and status of bills", async () => {
          const store = { bills: () => ({ list: jest.fn().mockResolvedValue([{ date: new Date().toISOString(), status: 'pending' }]) }) };
          const document = {
            querySelector: jest.fn(() => {
              return {
                addEventListener: jest.fn(),
                getAttribute: jest.fn(),
              };
            }),
            querySelectorAll: jest.fn(() => {
              return [];
            }),
          };
          const billsInstance = new Bills({ document, store });
          const result = await billsInstance.getBills();
          expect(typeof result[0].date).toBe('string');
          expect(typeof result[0].status).toBe('string');
        });

        it("should trigger navigation to NewBill when clicking the button", () => {
          const onNavigate = jest.fn();
          const bills = new Bills({ 
            document,
            onNavigate,
            store: null,
            localStorage: window.localStorage
          });

          document.body.innerHTML = BillsUI({ data: [] });

          const newBillButton = screen.getByTestId('btn-new-bill');
          newBillButton.addEventListener('click', () => bills.handleClickNewBill());

          expect(newBillButton).toBeTruthy();
          
          newBillButton.click();
          
          expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
        })
      });
    });
  })

describe("Given I am connected as an employee", () => {
  describe("When I click on the icon eye", () => {
    test("Then a modal should open", () => {
      document.body.innerHTML = `
        <div data-testid="icon-eye" data-bill-url="https://test.jpg"></div>
        <div id="modaleFile" class="modal">
          <div class="modal-body"></div>
        </div>
      `
      
      const mockModal = jest.fn();
      const jQueryMock = jest.fn(() => ({
        width: () => 400,
        find: () => ({
          html: jest.fn()
        }),
        modal: mockModal,
        click: jest.fn()
      }));
      global.$ = jQueryMock;

      const bills = new Bills({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage
      })

      const icon = document.querySelector(`div[data-testid="icon-eye"]`)
      
      bills.handleClickIconEye(icon)

      expect(jQueryMock).toHaveBeenCalledWith('#modaleFile')
      expect(mockModal).toHaveBeenCalledWith('show')
    })
  })
})