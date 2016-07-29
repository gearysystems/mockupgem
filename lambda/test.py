def parse_filename_into_components(filename):
    """
    >>> test_string = '133186f6-aad3-46c0-a83c-40fd424e7f35*iphone6_rough_texture*560_139|801_227|646_643|399_551*iphone6_rough_texture*560_139|801_227|646_643|399_551'

    >>> expected_response = {
    ...    'uuid': '133186f6-aad3-46c0-a83c-40fd424e7f35',
    ...    'mockups': [
    ...         {
    ...             'mockup_name': 'iphone6_rough_texture',
    ...             'screen_coordinates': [[560, 139], [801, 227], [646, 643], [399, 551]]
    ...         },
    ...         {
    ...             'mockup_name': 'iphone6_rough_texture',
    ...             'screen_coordinates': [[560, 139], [801, 227], [646, 643], [399, 551]]
    ...         }
    ...     ]
    ... }

    >>> assert(parse_filename_into_components(test_string)) == expected_response
    """

    # 133186f6-aad3-46c0-a83c-40fd424e7f35*iphone6_rough_texture*560_139*801_227*646_643*399_551
    # TO
    # ['133186f6-aad3-46c0-a83c-40fd424e7f35', 'iphone6_rough_texture', '560_139', ... etc]
    split_filename = filename.split('*')
    mockup_name_and_screen_cords = zip(split_filename[1::2], split_filename[2::2])
    mockups = [
        {
            'mockup_name': mockup_metdata[0],
            'screen_coordinates': parse_coord_string(mockup_metdata[1]),
        }
        for mockup_metdata
        in mockup_name_and_screen_cords
    ]
    return {
        'uuid': split_filename[0],
        'mockups': mockups,
    }


def parse_coord_string(coord_string):
    """
    >>> parse_coord_string('560_139|124_300|500_600|300_200')
    [[560, 139], [124, 300], [500, 600], [300, 200]]
    """
    # Remove brackets
    split_coords_string = coord_string.split('|')
    return [
        [int(coords.split('_')[0]), int(coords.split('_')[1])]
        for coords in split_coords_string
    ]
