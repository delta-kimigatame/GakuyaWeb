import "@testing-library/jest-dom";
global.URL.createObjectURL = (blob: Blob) => "blob:dummy-url";
