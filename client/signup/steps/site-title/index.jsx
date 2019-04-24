/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'gridicons';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
/*import SignupSiteTitle from 'components/signup-site-title';
import SiteTitleExample from 'components/site-title-example';*/
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import InfoPopover from 'components/info-popover';
import QueryVerticals from 'components/data/query-verticals';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { recordTracksEvent } from 'state/analytics/actions';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import {
	getSiteVerticalName,
	getSiteVerticalPreview,
} from 'state/signup/steps/site-vertical/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class SiteTitleStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setSiteTitle: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		translate: PropTypes.func.isRequired,
		siteTitle: PropTypes.string,
		siteVerticalName: PropTypes.string,
		shouldFetchVerticalData: PropTypes.bool,
		siteType: PropTypes.string,
	};

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	handleInputChange = siteTitle => this.props.setSiteTitle( siteTitle );

	submitSiteTitleStep = siteTitle => {
		const { goToNextStep, flowName, stepName, translate } = this.props;

		this.props.setSiteTitle( siteTitle );

		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Setting up your site' ),
				stepName,
				flowName,
			},
			[],
			{ siteTitle }
		);

		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_information', {
			user_entered_title: !! siteTitle,
		} );

		goToNextStep();
	};

	renderSiteTitleStep = () => {
		const {
			shouldFetchVerticalData,
			siteTitle,
			siteType,
			siteVerticalName,
			translate,
		} = this.props;
		const fieldLabel = getSiteTypePropertyValue( 'slug', siteType, 'siteTitleLabel' ) || '';
		const fieldPlaceholder =
			getSiteTypePropertyValue( 'slug', siteType, 'siteTitlePlaceholder' ) || '';
		const fieldDescription = translate(
			"We'll use this as your site title. Don't worry, you can change this later."
		);
		return (
			<div
				className={ classNames( 'site-information__wrapper', {
					'is-single-fieldset': true,
				} ) }
			>
				{ shouldFetchVerticalData && <QueryVerticals searchTerm={ siteVerticalName } /> }
				<Card>
					<form>
						<div className="site-information__field-control site-information__title">
							<FormFieldset>
								<FormLabel htmlFor="title">
									{ fieldLabel }
									<InfoPopover className="site-information__info-popover" position="top">
										{ fieldDescription }
									</InfoPopover>
								</FormLabel>
								<FormTextInput
									id="title"
									name="title"
									placeholder={ fieldPlaceholder }
									onChange={ this.handleInputChange }
									value={ siteTitle }
									maxLength={ 100 }
									autoFocus // eslint-disable-line jsx-a11y/no-autofocus
								/>
								<Button
									title={ this.props.translate( 'Continue' ) }
									aria-label={ this.props.translate( 'Continue' ) }
									primary
									type="submit"
									onClick={ this.handleSubmit }
								>
									<Gridicon icon="arrow-right" />
								</Button>{' '}
							</FormFieldset>
						</div>
					</form>
				</Card>
			</div>
		);
	};

	render() {
		const {
			flowName,
			positionInFlow,
			showSiteMockups,
			signupProgress,
			stepName,
			translate,
		} = this.props;
		const headerText = translate( "Tell us your site's name" );
		const subHeaderText = translate(
			'This will appear at the top of your site and can be changed at anytime.'
		);
		return (
			<div>
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					signupProgress={ signupProgress }
					stepContent={ this.renderSiteTitleStep() }
					showSiteMockups={ showSiteMockups }
				/>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteType = getSiteType( state );
		const shouldFetchVerticalData =
			ownProps.showSiteMockups && siteType === 'business' && getSiteVerticalPreview( state ) === '';
		return {
			siteTitle: getSiteTitle( state ),
			siteVerticalName: getSiteVerticalName( state ),
			shouldFetchVerticalData,
			siteType,
		};
	},
	{ recordTracksEvent, setSiteTitle }
)( localize( SiteTitleStep ) );
