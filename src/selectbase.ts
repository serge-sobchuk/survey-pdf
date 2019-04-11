import { IPoint, IRect, DocOptions, PdfQuestionRendererBase } from "./survey";
import { IQuestion, QuestionSelectBase, ItemValue } from "survey-core";
export class SelectBaseQuestion extends PdfQuestionRendererBase {
  constructor(protected question: IQuestion, protected docOptions: DocOptions) {
    super(question, docOptions);
  }
  // getBoundariesComment(point: IPoint): IRect {
  //   let question = this.getQuestion<QuestionSelectBase>();
  //   let textBoundaries = this.renderText(point, question.commentText, false);
  //   let width =
  //     question.commentText.length *
  //     this.docOptions.fontSize *
  //     this.docOptions.xScale;
  //   let height = this.docOptions.fontSize * this.docOptions.yScale;
  //   return {
  //     xLeft: textBoundaries.xLeft,
  //     xRight: textBoundaries.xLeft + width,
  //     yTop: textBoundaries.yTop,
  //     yBot: textBoundaries.yBot + height
  //   };
  // }
  // getBoudndariesItem(point: IPoint, itemValue: ItemValue): IRect {
  //   let buttonBoudndaries: IRect = {
  //     xLeft: point.xLeft,
  //     xRight:
  //       point.xLeft +
  //       this.docOptions.fontSize * this.docOptions.yScale,
  //     yTop: point.yTop,
  //     yBot:
  //       point.yTop + this.docOptions.fontSize * this.docOptions.yScale
  //   };
  //   let textPoint: IPoint = {
  //     xLeft: buttonBoudndaries.xRight,
  //     yTop: buttonBoudndaries.yTop
  //   };
  //   let textBoudndaries: IRect = this.renderText(textPoint, itemValue.text, false);
  //   return {
  //     xLeft: buttonBoudndaries.xLeft,
  //     xRight: textBoudndaries.xRight,
  //     yTop: buttonBoudndaries.yTop,
  //     yBot: buttonBoudndaries.yBot
  //   };
  // }
  // getBoundariesContent(point: IPoint): IRect {
  //   let bottom: number = point.yTop;
  //   let right: number = point.xLeft;
  //   let question: QuestionSelectBase = this.getQuestion<QuestionSelectBase>();
  //   let currPoint: IPoint = { xLeft: point.xLeft, yTop: point.yTop };
  //   question.choices.forEach((itemValue: ItemValue) => {
  //     let checkButtonBoundaries = this.getBoudndariesItem(currPoint, itemValue);
  //     bottom = checkButtonBoundaries.yBot;
  //     currPoint.yTop = bottom;
  //     right = Math.max(right, checkButtonBoundaries.xRight);
  //   });
  //   // if (question.hasComment) {
  //   //   let commentBoundaries = this.getBoundariesComment(currPoint);
  //   //   bottom = commentBoundaries.yBot;
  //   //   right = Math.max(right, commentBoundaries.xRight);
  //   // }
  //   return {
  //     xLeft: point.xLeft,
  //     xRight: right,
  //     yTop: point.yTop,
  //     yBot: bottom
  //   };
  // }
  getSortedChoices() {
    let question = this.getQuestion<QuestionSelectBase>();
    switch (question.choicesOrder) {
      case "none":
        return question.choices.slice();
      case "asc":
        return question.choices.slice().sort((a, b) => {
          return a.value > b.value ? 1 : -1;
        });
      case "desc":
        return question.choices.slice().sort((a, b) => {
          return a.value < b.value ? 1 : -1;
        });
      case "random":
        return question.choices.slice().sort((a, b) => {
          return Math.random() < 0.5 ? 1 : -1;
        });
    }
  }
  renderComment(point: IPoint, isRender: boolean) {
    let question = this.getQuestion<QuestionSelectBase>();
    let textBoundaries = this.renderText(point, question.commentText, false);
    let textField = new (<any>this.docOptions.doc.AcroFormTextField)();
    let width =
      question.commentText.length *
      this.docOptions.fontSize *
      this.docOptions.xScale;
    let height = this.docOptions.fontSize * this.docOptions.yScale;
    if (isRender) {
      this.renderText(point, question.commentText, true);
      textField.Rect = [
        textBoundaries.xLeft,
        textBoundaries.yBot,
        width,
        height
      ];
      textField.multiline = false;
      textField.value = "";
      this.docOptions.doc.addField(textField);
    }
    return {
      xLeft: textBoundaries.xLeft,
      xRight: textBoundaries.xLeft + width,
      yTop: textBoundaries.yTop,
      yBot: textBoundaries.yBot + height
    };
  }

  renderContentSelectbase(point: IPoint, isRender: boolean): IRect[] {
    return super.renderContent(point, isRender);
  }
  renderContent(point: IPoint, isRender: boolean): IRect[] {
    //renderComment
    return this.renderContentSelectbase(point, isRender);
  }
}