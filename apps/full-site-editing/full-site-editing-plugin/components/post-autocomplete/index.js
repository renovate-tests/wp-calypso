/**
 * External dependencies
 */
import { map, throttle } from 'lodash';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { Button, Popover, Spinner, TextControl } from '@wordpress/components';
import { withState } from '@wordpress/compose';
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

const updateSuggestions = throttle( async ( search, setState ) => {
	setState( {
		loading: true,
		showSuggestions: true,
		suggestions: [],
	} );

	const suggestions = await apiFetch( {
		path: addQueryArgs( '/wp/v2/search', {
			context: 'embed',
			per_page: 20,
			search,
		} ),
	} );

	setState( {
		loading: false,
		showSuggestions: true,
		suggestions,
	} );
} );

const selectSuggestion = async ( suggestion, setState ) => {
	setState( {
		loading: true,
		showSuggestions: false,
		suggestions: [],
	} );

	const postType = select( 'core' ).getEntityRecord( 'root', 'postType', suggestion.subtype );
	const selectedPost = await apiFetch( {
		path: `/wp/v2/${ postType.rest_base }/${ suggestion.id }`,
	} );

	setState( {
		loading: false,
	} );

	return selectedPost;
};
const PostAutocomplete = withState( {
	loading: false,
	search: '',
	showSuggestions: false,
	suggestions: [],
} )( ( { loading, onSelectPost, search, setState, showSuggestions, suggestions } ) => {
	const onChange = async inputValue => {
		setState( { search: inputValue } );
		if ( inputValue.length < 2 ) {
			setState( {
				loading: false,
				showSuggestions: false,
			} );
			return;
		}
		await updateSuggestions( inputValue, setState );
	};

	const onClick = suggestion => async () => {
		const selectedPost = await selectSuggestion( suggestion, setState );
		onSelectPost( selectedPost );
	};

	return (
		<div>
			<TextControl
				onChange={ onChange }
				placeholder={ __( 'Type to search' ) }
				type="search"
				value={ search }
			/>
			{ loading && <Spinner /> }
			{ showSuggestions && !! suggestions.length && (
				<Popover focusOnMount={ false } position="bottom">
					<div>
						{ map( suggestions, suggestion => (
							<Button isLink onClick={ onClick( suggestion ) }>
								{ suggestion.title }
							</Button>
						) ) }
					</div>
				</Popover>
			) }
		</div>
	);
} );

export default PostAutocomplete;
