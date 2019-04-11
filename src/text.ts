import {
  IPoint,
  IRect,
  QuestionRepository,
  DocOptions,
  PdfQuestionRendererBase
} from "./survey";
import { IQuestion } from "survey-core";
import { QuestionTextModel } from "survey-core";

export class TextQuestion extends PdfQuestionRendererBase {
  constructor(protected question: IQuestion, protected docOptions: DocOptions) {
    super(question, docOptions);
  }
  renderContent(point: IPoint, isRender: boolean): IRect[] {
    let question: QuestionTextModel = this.getQuestion<QuestionTextModel>();
    let width =
      question.title.length *
      this.docOptions.fontSize *
      this.docOptions.xScale;
    let height = this.docOptions.fontSize * this.docOptions.yScale;
    let boundaries: IRect = {
      xLeft: point.xLeft,
      xRight: point.xLeft + width,
      yTop: point.yTop,
      yBot: point.yTop + height
    };
    if (isRender) {
      let textField = new (<any>this.docOptions.doc.AcroFormTextField)();
      textField.Rect = [
        boundaries.xLeft,
        boundaries.yTop,
        boundaries.xRight - boundaries.xLeft,
        boundaries.yBot - boundaries.yTop
      ];
      textField.multiline = false;
      textField.value = question.value || "";
      textField.fieldName = question.id;
      this.docOptions.doc.addField(textField);
    }
    return [boundaries];
  }
}

QuestionRepository.getInstance().register("text", TextQuestion);