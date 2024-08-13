import * as yup from "yup";
const regColorCheck = /^#([0-9a-f]{3}){1,2}$/i;

yup.addMethod(
  yup.mixed,
  "imageDimensionCheck",
  function ({ requiredWidth, requiredHeight, isOptional = false, size, onlyPng }) {
    return this.test("image-width-height-check", "test", async function (value) {
      const { path, createError } = this;
      if (typeof value === "string") {
        return true;
      }
      if (!value) {
        if (isOptional) return true;
        else return;
      }
      try {
        if (onlyPng) {
          if (value.type !== "image/png") {
            return createError({
              path,
              message: `Only .png files are supported`,
            });
          }
        } else {
          if (value.type !== "image/png" && value.type !== "image/jpeg") {
            return createError({
              path,
              message: `Only .png, .jpg, and .jpeg file formats are supported.`,
            });
          }
        }
        if (value.size / 1000 / 1000 > size) {
          return createError({
            path,
            message: `The file size should be less than ${size} MB.`,
          });
        }
        if (requiredWidth !== 0 && requiredHeight !== 0) {
          const imgDimensions = { width: null, height: null };
          await new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(value);
            reader.onload = function () {
              const img = new Image();
              img.src = reader.result;
              img.onload = function () {
                imgDimensions.width = img.width;
                imgDimensions.height = img.height;
                resolve(imgDimensions);
              };
            };
          });
          if (requiredWidth < imgDimensions.width) {
            return createError({
              path,
              message: `The image width must be less than ${requiredWidth}px.`,
            });
          }
          if (requiredHeight < imgDimensions.height) {
            return createError({
              path,
              message: `The image width must be less than ${requiredWidth}px.`,
            });
          }
        }
        return true;
      } catch (error) {
        return createError({
          path,
          message: `Something went wrong with the upload.`,
        });
      }
    });
  }
);

export const projectConfigValidation = yup
  .object({
    allowListName: yup
      .string()
      .required("Input is required.")
      .min(2, "Please enter a name with at least 2 characters.")
      .max(32, "Please enter a name with no more than 33 characters."),
    projectName: yup
      .string()
      .required("Project name is required.")
      .min(2, "Project name must be at least 2 characters.")
      .max(32, "Project name can be at most 32 characters long."),
    projectDescription: yup.string().nullable().max(5000, "Project description must not exceed 5000 characters."),
    projectLogo: yup
      .mixed()
      .required("Input is required.")
      .imageDimensionCheck({ requiredWidth: 0, requiredHeight: 0, size: 5, onlyPng: false }),
    projectLogoName: yup.string(),
    projectIcon: yup
      .mixed()
      .notRequired()
      .imageDimensionCheck({ requiredWidth: 0, requiredHeight: 0, isOptional: true, size: 5, onlyPng: false }),
    projectIconName: yup.string(),
    projectBackgroundImage: yup
      .mixed()
      .required("Input is required.")
      .imageDimensionCheck({ size: 10, onlyPng: false }),
    projectBackgroundName: yup.string(),
    urlSlug: yup.string().notRequired(),
    projectWebsite: yup.string().url("Invalid link").required(),
    discordInviteLink: yup.string().url("Invalid link").notRequired(),
    primaryColour: yup.mixed().notRequired(),
    secondaryColour: yup.mixed().notRequired(),
    discord: yup.object().required("Input is required."),
    twitter: yup.mixed().notRequired(),
  })
  .required();

yup.addMethod(yup.array, "unique", function (message, path) {
  return this.test("unique", message, function (list) {
    let idx = "";
    let isUnique = true;

    list?.map((group1, i) =>
      list?.map((group2, i2) => {
        if (
          i !== i2 && // by pass if it same index because loop inside loop so it will duplicate
          group1[path] &&
          group2[path] &&
          group1[path] === group2[path]
        ) {
          idx = i;
          isUnique = false;
        }
      })
    );
    if (isUnique) {
      return true;
    }

    return this.createError({ path: `${this.path}[${idx}].${path}`, message });
  });
});

// yup.addMethod(yup.array, "uniqueCriteria", function (message) {
//   return this.test("uniqueCriteria", message, function (list) {
//     let idx = "";
//     let areGroupsUnique = true;

//     list?.map((group1, i) => {
//       list?.map((group2, i2) => {
//         if (
//           i !== i2 && // by pass if it same index because loop inside loop so it will duplicate
//           group1?.isPrivate === group2?.isPrivate &&
//           group1?.groupType === group2?.groupType &&
//           group1?.minBalance === group2?.minBalance
//         ) {
//           if (group1?.twitterActivity.length === group2?.twitterActivity.length) {
//             if (group1?.twitterActivity.length === 0 && group2?.twitterActivity.length === 0) {
//               idx = i;
//               areGroupsUnique = false;
//             } else {
//               const intersection = group1?.twitterActivity.some((element) =>
//                 group2?.twitterActivity.map((item) => item?.value).includes(element?.value)
//               );
//               if (intersection) {
//                 idx = i;
//                 areGroupsUnique = false;
//               }
//             }
//           }
//         }
//       });
//     });

//     if (areGroupsUnique) {
//       return true;
//     }
//     return this.createError({ path: `${this.path}[${idx}]`, message });
//   });
// });

export const checkUniqueCriteria = (allowlistGroup, data) => {
  let errorMsg = false;
  allowlistGroup.forEach((group1) => {
    if (group1?.groupName === data.groupName) {
      errorMsg = "Collab names must be unique.";
      return;
    }
    // if (!data.isPrivate) {
    //   if (group1?.isPrivate === data.isPrivate && group1?.minBalance === data.minBalance) {
    //     errorMsg = "Qualification criteria must be unique.";
    //     return;
    //   }
    // }
    // if (
    //   data.isPrivate &&
    //   group1?.isPrivate === data.isPrivate &&
    //   group1?.groupType === data.groupType &&
    //   group1?.minBalance === data.minBalance
    // ) {
    //   if (group1?.twitterActivity.length === data.twitterActivity.length) {
    //     if (group1?.twitterActivity.length === 0 && data.twitterActivity.length === 0) {
    //       errorMsg = "Qualification criteria must be unique.";
    //       return;
    //     } else {
    //       const intersection = group1?.twitterActivity.some((element) =>
    //         data.twitterActivity.map((item) => item?.value).includes(element)
    //       );
    //       if (intersection) {
    //         errorMsg = "Qualification criteria must be unique.";
    //         return;
    //       }
    //     }
    //   }
    // }
  });
  return errorMsg;
};

export const groupSchema = yup.object().shape(
  {
    isPrivate: yup.boolean().required(),
    groupName: yup
      .string()
      .max(32, "Please enter a name with no more than 32 characters.")
      .required("Collab name is required"),
    description: yup.string().notRequired().max(500, "Collab description must not exceed 500 characters."),
    groupIcon: yup
      .mixed()
      .notRequired()
      .imageDimensionCheck({ requiredWidth: 0, requiredHeight: 0, isOptional: true, size: 5, onlyPng: false }),

    isWalletBalance: yup.boolean().required(),
    minBalance: yup.number().when("isWalletBalance", {
      is: (value) => Boolean(value),
      then: yup
        .number()
        .required("Input is required.")
        .typeError("Must be a number.")
        .test("Is positive?", "Must be a positive number.", (value) => value > 0),
      otherwise: yup.number().notRequired().nullable(true),
    }),

    groupType: yup.string().when("isPrivate", {
      is: true,
      then: yup.string().required(),
    }),
    maxRegistrations: yup.number().when("isPrivate", {
      is: (value) => value,
      then: yup
        .number()
        .notRequired()
        .nullable(true)
        .typeError("Only numbers are allowed.")
        .test("Is positive?", "Must be a positive integer.", (value) =>
          value ? Number.isInteger(value) && value > 0 : true
        )
        .max(9999999999, "Maximum limit reached")
        .transform((_, val) => (val !== "" ? Number(val) : null)),
      otherwise: yup.number().notRequired().nullable(true),
    }),

    // .when(["isPrivate", "groupType"], (isPrivate, groupType, schema) => {
    //   return isPrivate && groupType === "first-come"
    //     ? schema
    //         .required("Max Allowed Registrations")
    //         .typeError("Please fill a Max Allowed Registrations to proceed.")
    //     : schema.nullable().notRequired();
    // }),

    noOfWinners: yup.string().when(["isPrivate", "groupType"], {
      is: (isPrivate, groupType) => isPrivate && groupType === "raffle",
      then: yup
        .string()
        .required()
        .typeError("Only numbers are allowed.")
        .test("min0", "Must be greater than 0.", (value) => value > 0)
        .test("winnerReg", "Must be less than Max Registrations.", (value, context) => {
          return context.parent.maxRegistrations ? parseInt(context.parent.maxRegistrations) > parseInt(value) : true;
        }),
      otherwise: yup.string().nullable().notRequired(),
    }),

    tokengating: yup.boolean().required(),
    minToken: yup.number().when(["address", "tokengating"], {
      is: (address, tokengating) => Boolean(address) || tokengating,
      then: yup
        .number()
        .required()
        .test("Is positive?", "Number should be greater than 0", (value) => value > 0)
        .typeError("Please fill a number to proceed."),
      otherwise: yup
        .number()
        .notRequired()
        .nullable(true)
        // .test("Is positive?", "Number should be greater than 0", (value) => value >= 0)
        // .typeError("Please fill a number to proceed...")
        .transform((_, val) => (val !== "" ? Number(val) : null)),
    }),
    address: yup.string().when(["minToken", "tokengating"], {
      is: (minToken, tokengating) => minToken > 0 && tokengating,
      then: yup.string().required("Please enter the contract address to proceed."),
      otherwise: yup.string().notRequired(),
    }),
    referralCodeIsOn: yup.boolean().required(),
    numberOfCodes: yup.number().when("referralCodeIsOn", (referralCodeIsOn, schema) =>
      !referralCodeIsOn
        ? schema
            .required("Input is required.")
            .typeError("Only numbers are allowed.")
            .test("Is positive?", "Must be greater than 0.", (value) => value >= 1)
        : schema
            .notRequired()
            .nullable(true)
            .transform((_, val) => (val === Number(val) ? val : null))
    ),
    numberOfCodesOnSelection: yup.number().when("referralCodeIsOn", (referralCodeIsOn, schema) =>
      !referralCodeIsOn
        ? schema
            .required("Input is required.")
            .typeError("Only numbers are allowed.")
            .test("Is positive?", "Must be greater than 0.", (value) => value >= 1)
        : schema
            .notRequired()
            .nullable(true)
            .transform((_, val) => (val === Number(val) ? val : null))
    ),
    referralCodesRequired: yup.boolean().notRequired(),
    isSchedule: yup.boolean().required(),
    scheduleStartDate: yup.date().notRequired(),
    scheduleEndDate: yup.date().notRequired(),
    assignDiscordRoleOnSelectionFlag: yup.boolean().notRequired(),
    discordServerRoles: yup.array().when("isPrivate", {
      is: (isPrivate) => isPrivate,
      then: yup
        .array()
        .of(
          yup.object().shape({
            guildId: yup.string().required("Required."),
            roles: yup.array().of(yup.mixed()).min(1, "Required.").required("Required."),
          })
        )
        .min(1, "Required.")
        .unique("Discord criteria must be unique.", "guildId"),
    }),
    assignDiscordRoleOnSelection: yup.object().when(["isPrivate", "assignDiscordRoleOnSelectionFlag"], {
      is: (isPrivate, assignDiscordRoleOnSelectionFlag) => isPrivate && assignDiscordRoleOnSelectionFlag,
      then: yup.object().shape({
        guildId: yup.string().required("Please fill the field to proceed."),
        roleId: yup.string().when("guildId", {
          is: (value) => value === "",
          then: yup.string().notRequired(),
          otherwise: yup.string().required("Please fill the field to proceed."),
        }),
      }),
    }),
    twitterActivity: yup.array().of(yup.mixed()).notRequired(),
    tweets: yup.array().of(yup.mixed()).notRequired().max(5, "Tweets limit reached."),

    questions: yup.array().when(["isPrivate", "groupType"], {
      is: (isPrivate, groupType) => isPrivate && groupType === "qna",
      then: yup
        .array()
        .of(
          yup.object().shape({
            questionType: yup.string().required("Input is required."),
            responseType: yup.string().required("Input is required."),
            question: yup
              .string()
              .required("")
              .min(2, "Must be at least 2 characters.")
              .max(1000, "Must be less than 1000 characters."),
            textConditionType: yup.string().when("questionType", {
              is: "textual",
              then: yup.string().required(),
            }),
            numericType: yup.object().when(["responseType", "questionType"], (responseType, questionType, schema) =>
              schema.shape({
                value:
                  responseType === "correctly" && questionType === "numeric"
                    ? yup.number().required().typeError("Only numbers are allowed.")
                    : yup.number().notRequired(),

                comparisonType:
                  responseType === "correctly" && questionType === "numeric"
                    ? yup.string().required()
                    : yup.string().notRequired(),
              })
            ),
            mcqOptions: yup.array().when("questionType", {
              is: "mcq",
              then: yup
                .array()
                .of(
                  yup.object().shape({
                    option: yup.string().required("Input is required."),
                    isCorrect: yup.boolean(),
                  })
                )
                .required()
                .min(2, "At least 2 options are required.")
                .max(16, "Only 16 options allowed.")
                .unique("Options cannot be identical", "option")
                .when("responseType", {
                  is: "correctly",
                  then: yup.array().test("optionOne", "Please mark at least one option as correct.", (value) => {
                    return value.filter((item) => item.isCorrect).length > 0;
                  }),
                }),
            }),
          })
        )
        .min(1, "At least 1 question is required.")
        .unique("Questions must be unique.", "question"),
    }),
  },
  ["minToken", "address"]
);

export const secondStepValidation = yup
  .object({
    groupList: yup
      .array()
      .of(groupSchema)
      .min(1, "At least 1 collab is required.")
      // .uniqueCriteria("Qualification criteria must be unique.")
      .unique("Collab names must be unique.", "groupName"),
  })
  .required();

export const groupIconValidation = yup.object().shape({
  description: yup.string().nullable().max(500, "Collab description must be at most 500 characters."),
  groupIcon: yup
    .mixed()
    .notRequired()
    .imageDimensionCheck({ requiredWidth: 0, requiredHeight: 0, isOptional: true, size: 5, onlyPng: false }),
});

export const createRoleValidation = yup.object().shape({
  createServer: yup.string().nullable().required("Select required."),
  createRoleName: yup
    .string()
    .nullable()
    .max(32, "Role name must be at most 32 characters")
    .required("Role name is required."),
  createRoleColor: yup
    .mixed()
    .test("color", "Invalid code", (value) => regColorCheck.test(value))
    .required("Role color is required."),
});
