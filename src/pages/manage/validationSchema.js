import * as yup from "yup";

export const issueAccessCodeValidation = yup
  .object({
    keyword: yup.string().required("Keywords must be unique."),

    noOfCodes: yup
      .number()
      .required()
      .nullable()
      .typeError("Please fill a number to proceed.")
      .test("min0", "Must be greater than 0.", (value) => value > 0)
      .test("Is positive?", "Must be a positive integer.", (value) => Number.isInteger(value) && value > 0)
      .max(10000, "Maximum limit reached"),
  })
  .required();
