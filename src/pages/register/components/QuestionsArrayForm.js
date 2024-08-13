import React from "react";
import { BsX } from "react-icons/bs";
import { useFieldArray, get, useFormContext, Controller } from "react-hook-form";

import FormInput from "../../../components/FormInput";
import { QAinitialValue } from "./GroupsForm";

const OptionsArrayForm = ({ namePrefix, dataItem, editModal }) => {
  const {
    formState: { errors, isSubmitted },
    control,
    getValues,
    setValue,
    watch,
  } = useFormContext();

  const { fields, remove, append } = useFieldArray({
    control,
    name: namePrefix,
  });
  const error = get(errors, namePrefix);

  return (
    <div>
      <div className="radio-buttons row">
        {fields.map((item, i) => (
          <div className="col-md-6" key={item.id}>
            <div className="radio-form-group">
              {dataItem?.questionType === "mcq" && dataItem?.responseType === "correctly" && (
                <Controller
                  control={control}
                  name={`${namePrefix}.${i}.isCorrect`}
                  render={({ field }) => {
                    const isCorrect = watch(`${namePrefix}.${i}.isCorrect`);
                    return (
                      <>
                        <input
                          type="checkbox"
                          // disabled={editModal}
                          id={`${namePrefix}.${i}.isCorrect`}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // if you want multipal select then comment next two
                            const oldOldValue = getValues(`${namePrefix}`).map((it, j) => ({
                              ...it,
                              isCorrect: i === j ? e.target.checked : false,
                            }));
                            setValue(namePrefix, oldOldValue, { shouldTouch: true, shouldValidate: true });
                          }}
                        />
                        <label htmlFor={`${namePrefix}.${i}.isCorrect`} className={`${isCorrect ? "checked" : ""}`} />
                      </>
                    );
                  }}
                />
              )}
              <FormInput
                type="text"
                className="m-0 w-100"
                inputClassName="option-field"
                placeholder={`Option ${i + 1}`}
                name={`${namePrefix}.${i}.option`}
              />
              {fields.length > 2 && (
                <button
                  type="button"
                  disabled={editModal}
                  onClick={() => remove(i)}
                  className="button btn option-remove"
                >
                  <BsX />
                </button>
              )}
            </div>
          </div>
        ))}

        {error && isSubmitted && error.type === "optionOne" && (
          <div className="form-error">
            <div className="error-text mt-1">
              <span className="info">i</span>
              <span>{error?.message}</span>
            </div>
          </div>
        )}
        <div className={fields.length % 2 === 1 ? "col-md-6" : ""}>
          <button
            disabled={editModal || fields.length > 5}
            type="button"
            onClick={() => append({ option: "" })}
            className={`btn btn-opt-add mx-auto ${fields.length % 2 === 0 ? "w-50 mt-3" : "mt-2"}`}
          >
            + Add Option
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionsArrayForm = ({ namePrefix, editModal }) => {
  const { control, watch, setValue } = useFormContext();
  const { fields, remove, append } = useFieldArray({
    control,
    name: namePrefix,
  });

  const questionsVal = watch(namePrefix);

  return (
    <>
      {fields?.map((it, i) => {
        const item = questionsVal[i];

        return (
          <div key={it.id}>
            <div className={`question-wrap ${i === 0 ? "mt-3" : "mt-5"}`}>
              <div className="question-first">
                {fields?.length > 1 && !editModal && (
                  <div className="question-close-tooltip">
                    <div className="custom-tooltip">
                      <button type="button" className="button btn sp-remove p-1" onClick={() => remove(i)}>
                        <BsX />
                      </button>
                      <span
                        style={{ maxWidth: "100px", left: "100%", top: "40px" }}
                        className="tooltip-text custom-tooltip-bottom"
                      >
                        Delete question
                      </span>
                    </div>
                  </div>
                )}
                <div className="row">
                  <div className="col-md-6">
                    <div className="question-first-left">
                      <div className="question-num">
                        <span>{i + 1}</span>
                      </div>
                      <div className="comon-input-div mb-0">
                        <FormInput
                          name={`${namePrefix}.${i}.questionType`}
                          type="select"
                          disabled={editModal}
                          options={[
                            { label: "MCQ", value: "mcq" },
                            { label: "Numeric", value: "numeric" },
                            { label: "Text-Based", value: "textual" },
                          ]}
                          onChange={() => {
                            setValue(`${namePrefix}.${i}.responseType`, "optional");
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="question-first-right">
                      <div className="comon-input-div mb-0">
                        <FormInput
                          name={`${namePrefix}.${i}.responseType`}
                          type="select"
                          disabled={editModal}
                          options={
                            item.questionType === "textual"
                              ? [
                                  { label: "Must Respond", value: "must" },
                                  { label: "Optional", value: "optional" },
                                ]
                              : [
                                  { label: "Must Respond", value: "must" },
                                  { label: "Optional", value: "optional" },
                                  { label: "Must Respond Correctly", value: "correctly" },
                                ]
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <FormInput
                  // disabled={editModal}
                  name={`${namePrefix}.${i}.question`}
                  type="text"
                  placeholder="Question"
                />
              </div>
              {item?.questionType === "mcq" && (
                <OptionsArrayForm editModal={editModal} dataItem={item} namePrefix={`${namePrefix}.${i}.mcqOptions`} />
              )}
              {item?.questionType === "textual" && item?.responseType !== "correctly" && (
                <div>
                  <div className="comon-input-div mb-0">
                    <FormInput
                      // disabled={editModal}
                      name={`${namePrefix}.${i}.textConditionType`}
                      type="select"
                      options={[
                        { label: "Long-type", value: "long-type" },
                        { label: "Short-type", value: "short-type" },
                      ]}
                    />
                  </div>
                </div>
              )}
              {item?.questionType === "numeric" && item?.responseType === "correctly" && (
                <div className="row">
                  <div className="col-lg-6">
                    <div className="comon-input-div">
                      <FormInput
                        // disabled={editModal}
                        name={`${namePrefix}.${i}.numericType.comparisonType`}
                        type="select"
                        options={[
                          { label: "Greater than", value: "GT" },
                          { label: "Less than", value: "LT" },
                          { label: "Equal to", value: "EQ" },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <FormInput type="number" name={`${namePrefix}.${i}.numericType.value`} step="any" />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div>
        <button
          type="button"
          className="btn btn-opt-add mt-3 mx-auto"
          style={{ maxWidth: "90%" }}
          disabled={editModal}
          onClick={() => append(QAinitialValue)}
        >
          + Add Question
        </button>
      </div>
    </>
  );
};

export default QuestionsArrayForm;
