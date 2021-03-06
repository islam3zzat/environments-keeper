import React from "react";
import { render, fireEvent, wait } from "@testing-library/react";
import EnvironmentForm from "./environment-form";
import { errorMessages } from "./environment-form-utils";

describe("EnvironmentForm", () => {
  describe("with valid values workflow", () => {
    it("should complete the wrokflow without validation errors", async () => {
      const onSubmit = jest.fn();
      const { getByPlaceholderText, getByText, queryAllByText } = render(
        <EnvironmentForm
          onSubmit={onSubmit}
          environments={[
            {
              name: "google env",
              url: "https://www.google.de/"
            }
          ]}
        />
      );
      const nameInput = getByPlaceholderText("Environment name");
      const urlInput = getByPlaceholderText(
        "Enter URL: e.g https://example.com"
      );
      // initial state
      expect(getByText("Save environment")).toBeDisabled();
      expect(nameInput).toBeInTheDocument();
      expect(urlInput).toBeInTheDocument();

      expect(queryAllByText(errorMessages.noValueError)).toEqual([]);

      expect(queryAllByText(errorMessages.duplicateNameError)).toEqual([]);

      expect(queryAllByText(errorMessages.invalidUrlError)).toEqual([]);

      // After entering valid name
      const nextNameValue = "new value";
      fireEvent.change(nameInput, { target: { value: nextNameValue } });
      expect(nameInput).toHaveValue(nextNameValue);
      expect(queryAllByText(errorMessages.noValueError)).toEqual([]);
      expect(queryAllByText(errorMessages.duplicateNameError)).toEqual([]);
      expect(
        queryAllByText("Please provide some value for this field.")
      ).toEqual([]);
      await wait(() => expect(getByText("Save environment")).toBeDisabled());
      // After entering valid url
      const nextUrlValue = "https://example.com";
      fireEvent.change(urlInput, { target: { value: nextUrlValue } });
      expect(urlInput).toHaveValue(nextUrlValue);
      await wait(() =>
        expect(getByText("Save environment")).not.toBeDisabled()
      );
    });
  });
  describe("with in-valid values workflow", () => {
    it("should show validation errors", async () => {
      const onSubmit = jest.fn();
      const { getByPlaceholderText, getByText, queryAllByText } = render(
        <EnvironmentForm
          onSubmit={onSubmit}
          environments={[
            {
              name: "google env",
              url: "https://www.google.de/"
            }
          ]}
        />
      );
      const nameInput = getByPlaceholderText("Environment name");
      const urlInput = getByPlaceholderText(
        "Enter URL: e.g https://example.com"
      );
      // initial state
      expect(getByText("Save environment")).toBeDisabled();
      expect(nameInput).toBeInTheDocument();
      expect(urlInput).toBeInTheDocument();

      expect(queryAllByText(errorMessages.noValueError)).toEqual([]);

      expect(queryAllByText(errorMessages.duplicateNameError)).toEqual([]);

      expect(queryAllByText(errorMessages.invalidUrlError)).toEqual([]);
      // after touching the input and leaving without typing
      fireEvent.touchStart(nameInput);
      fireEvent.blur(nameInput);
      await wait(() =>
        expect(getByText(errorMessages.noValueError)).toBeInTheDocument()
      );
      // After entering an invalid name
      const nextNameValue = "google env";
      fireEvent.change(nameInput, { target: { value: nextNameValue } });
      expect(nameInput).toHaveValue(nextNameValue);
      await wait(() =>
        expect(getByText(errorMessages.duplicateNameError)).toBeInTheDocument()
      );
      await wait(() => expect(getByText("Save environment")).toBeDisabled());
      // after touching the input and leaving without typing
      fireEvent.touchStart(urlInput);
      fireEvent.blur(urlInput);
      await wait(() =>
        expect(getByText(errorMessages.noValueError)).toBeInTheDocument()
      );
      // After entering an invalid url
      const nextUrlValue = "normal text";
      fireEvent.change(urlInput, { target: { value: nextUrlValue } });
      expect(urlInput).toHaveValue(nextUrlValue);
      await wait(() =>
        expect(getByText(errorMessages.invalidUrlError)).toBeInTheDocument()
      );
      await wait(() => expect(getByText("Save environment")).toBeDisabled());
      // After correcting the inputs
      fireEvent.change(nameInput, { target: { value: "archive" } });
      fireEvent.change(urlInput, { target: { value: "https://archive.org/" } });
      await wait(() =>
        expect(getByText("Save environment")).not.toBeDisabled()
      );
    });
  });
});
