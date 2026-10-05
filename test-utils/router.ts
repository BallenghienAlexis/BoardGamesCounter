// Router Expo factice partagé entre le mock global et les tests.
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};
