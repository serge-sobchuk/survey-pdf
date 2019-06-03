(<any>window)['HTMLCanvasElement'].prototype.getContext = () => {
    return {};
};

import { SurveyPDF } from '../src/survey';
import { FlatTextbox } from '../src/flat_layout/flat_textbox';
import { FlatComment } from '../src/flat_layout/flat_comment';
import { TestHelper } from '../src/helper_test';
let __dummy_tx = new FlatTextbox(null, null);
let __dummy_cm = new FlatComment(null, null);

async function checkTextboxValue(json: any, tobe: string,
	data: any = null, tobeDef: string = null, readOnly: boolean = false) {
  	let survey: SurveyPDF = new SurveyPDF(json, TestHelper.defaultOptions);
    if (data !== null) {
      survey.data = data;
    }
    await survey.render();
    expect(survey.controller.doc.internal.acroformPlugin.acroFormDictionaryRoot.Fields[0].value)
		.toBe(tobe);
	if (tobeDef != null) {
		expect(survey.controller.doc.internal.acroformPlugin.acroFormDictionaryRoot.Fields[0].defaultValue)
        	.toBe(tobeDef);
	}
	expect(survey.controller.doc.internal.acroformPlugin.acroFormDictionaryRoot.Fields[0].readOnly)
		.toBe(readOnly);
}
test('Set textbox no value', () => {
    let json = { questions: [ {
        name: 'textbox',
        type: 'text',
        title: 'NoValue:'
      }]
    };
    checkTextboxValue(json, '');
});
test('Set textbox default value', () => {
    let json = { questions: [ {
        name: 'textbox',
        type: 'text',
        title: 'NeedDefValue:',
        defaultValue: 'OhYes'
      }]
    };
    checkTextboxValue(json, json.questions[0].defaultValue);
});
test('Set textbox data value', () => {
    let json = { questions: [ {
        name: 'textbox',
        type: 'text',
        title: 'NeedValue:'
      }]
    };
    let data = {
      textbox: 'Spider pig'
    };
    checkTextboxValue(json, data.textbox, data);
});
test('Set textbox data value with default value', () => {
    let json = { questions: [ {
        name: 'textbox',
        type: 'text',
        title: 'NeedValue:',
        defaultValue: 'Only not me'
      }]
    };
    let data = {
        textbox: 'Invisible black'
	};
	checkTextboxValue(json, data.textbox, data);
});
test('Check textbox password value is empty string', () => {
	let json = { questions: [ {
		name: 'pass',
		type: 'text',
		title: 'I am clean',
		inputType: 'password'
		}]
	};
	checkTextboxValue(json, '');
});
test('Check textbox password with data value is empty str', () => {
	let json = { questions: [ {
		name: 'pass',
		type: 'text',
		title: 'I am clean',
		inputType: 'password'
		}]
	};
	let data = {
		pass: 'Garbage'
	};
	checkTextboxValue(json, '', data);
});
test('Check textbox password with default value is empty str', () => {
  let json = { questions: [ {
      name: 'pass',
      type: 'text',
      title: 'I am clean',
      defaultValue: 'qwerty',
      inputType: 'password'
    }]
  };
  checkTextboxValue(json, '');
});
test('Check textbox password with data and default value is empty str', () => {
	let json = { questions: [ {
		name: 'pass',
		type: 'text',
		title: 'I am clean',
		defaultValue: 'qwerty',
		inputType: 'password'
		}]
	};
	let data = {
		pass: 'Ignore'
	};
	checkTextboxValue(json, '', data);
});
test('Set textbox placeHolder', () => {
	let json = { questions: [ {
		name: 'holder',
		type: 'text',
		title: 'Hearth',
		placeHolder: 'keeper'
		}]
	};
	checkTextboxValue(json, '', null, json.questions[0].placeHolder);
});
test('Set textbox defaultValue with placeHolder', () => {
	let json = { questions: [ {
		name: 'holder',
		type: 'text',
		title: 'Birds',
		defaultValue: 'griffin',
		placeHolder: 'gull'
		}]
	};
	checkTextboxValue(json, json.questions[0].defaultValue, null, json.questions[0].placeHolder);
});
test('Set textbox data with defaultValue and placeHolder', () => {
	let json = { questions: [ {
		name: 'holder',
		type: 'text',
		title: 'Birds',
		defaultValue: 'griffin',
		placeHolder: 'gull'
		}]
	};
	let data = {
		holder: 'phoenix'
	};
	checkTextboxValue(json, data.holder, data, json.questions[0].placeHolder);
});
test('Check not readOnly textbox', () => {
	let json = { questions: [ {
		name: 'readtext',
		type: 'text',
		title: 'Write also'
		}]
	};
	checkTextboxValue(json, '', null, '', false);
});

test('Check readOnly textbox', () => {
	let json = { questions: [ {
		name: 'readtext',
		type: 'text',
		title: 'Read only',
		readOnly: true
		}]
	};
	checkTextboxValue(json, '', null, '', true);
});
test('Set comment no value', () => {
	let json = { questions: [ {
			name: 'comment',
			type: 'comment',
			title: 'NoValue:'
		}]
	};
	checkTextboxValue(json, '');
});