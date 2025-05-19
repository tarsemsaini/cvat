// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import DatePicker from 'antd/lib/date-picker';
import { Row, Col } from 'antd/lib/grid';
import Popover from 'antd/lib/popover';
import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import { importActions } from 'actions/import-actions';
import { SortingComponent, ResourceFilterHOC, defaultVisibility } from 'components/resource-sorting-filtering';
import { TasksQuery } from 'reducers';
import { usePrevious } from 'utils/hooks';
import { MultiPlusIcon } from 'icons';
import dimensions from 'utils/dimensions';
import CvatDropdownMenuPaper from 'components/common/cvat-dropdown-menu-paper';
import {
    localStorageRecentKeyword, localStorageRecentCapacity, predefinedFilterValues, config,
} from './tasks-filter-configuration';

const FilteringComponent = ResourceFilterHOC(
    config, localStorageRecentKeyword, localStorageRecentCapacity, predefinedFilterValues,
);

interface VisibleTopBarProps {
    onApplyFilter(filter: string | null): void;
    onApplySorting(sorting: string | null): void;
    onApplySearch(search: string | null): void;
    query: TasksQuery;
    importing: boolean;
    // onDateFromChange(date: string | null): void;
    onDateToChange(date: string | null, fromDate: string | null): void;
}

export default function TopBarComponent(props: VisibleTopBarProps): JSX.Element {
    const dispatch = useDispatch();
    const {
        importing, query, onApplyFilter, onApplySorting, onApplySearch, onDateToChange,
    } = props;
    const [visibility, setVisibility] = useState(defaultVisibility);
    const [isFromDate, setIsFromDate] = useState<string | null>(null);
    const [isToDate, setIsToDate] = useState<string | null>(null);
    const history = useHistory();
    const prevImporting = usePrevious(importing);

    useEffect(() => {
        if (prevImporting && !importing) {
            onApplyFilter(query.filter);
        }
    }, [importing]);

    const handleCreateFrom = (date: Date | null): void => {
        if (!date) {
            setIsFromDate(null);
            setIsToDate(null);
            onDateToChange(null, null);
            return;
        }

        const fromDate = date.toISOString();
        setIsFromDate(fromDate);

        if (isToDate) {
            onDateToChange(isToDate, fromDate);
        }
    };

    const handleCreateTo = (date: Date | null): void => {
        if (!date) {
            setIsFromDate(null);
            setIsToDate(null);
            onDateToChange(null, null);
            return;
        }

        const toDate = date.toISOString();
        setIsToDate(toDate);

        if (isFromDate) {
            onDateToChange(toDate, isFromDate);
        }
    };


    return (
        <Row className='cvat-tasks-page-top-bar' justify='center' align='middle'>
            <Col {...dimensions}>
                <div className='cvat-tasks-page-filters-wrapper'>
                    <Input.Search
                        enterButton
                        onSearch={(phrase: string) => {
                            onApplySearch(phrase);
                        }}
                        defaultValue={query.search || ''}
                        className='cvat-tasks-page-search-bar'
                        placeholder='Search ...'
                    />
                    <div className='cvat-tasks-page-date-pickers'>
                        <DatePicker
                            placeholder='Created from'
                            onChange={(date) => handleCreateFrom(date ? date.toDate() : null)}
                            allowClear
                            className='cvat-tasks-page-date-from'
                        />

                        <DatePicker
                            placeholder='Created to'
                            onChange={(date) => handleCreateTo(date ? date.toDate() : null)}
                            allowClear
                            className='cvat-tasks-page-date-to'
                        />

                    </div>
                    <div>
                        <SortingComponent
                            visible={visibility.sorting}
                            onVisibleChange={(visible: boolean) => (
                                setVisibility({ ...defaultVisibility, sorting: visible })
                            )}
                            defaultFields={query.sort?.split(',') || ['-ID']}
                            sortingFields={['ID', 'Owner', 'Status', 'Assignee', 'Updated date', 'Subset', 'Mode', 'Dimension', 'Project ID', 'Name', 'Project name']}
                            onApplySorting={onApplySorting}
                        />
                        <FilteringComponent
                            value={query.filter}
                            predefinedVisible={visibility.predefined}
                            builderVisible={visibility.builder}
                            recentVisible={visibility.recent}
                            onPredefinedVisibleChange={(visible: boolean) => (
                                setVisibility({ ...defaultVisibility, predefined: visible })
                            )}
                            onBuilderVisibleChange={(visible: boolean) => (
                                setVisibility({ ...defaultVisibility, builder: visible })
                            )}
                            onRecentVisibleChange={(visible: boolean) => (
                                setVisibility({ ...defaultVisibility, builder: visibility.builder, recent: visible })
                            )}
                            onApplyFilter={onApplyFilter}
                        />
                    </div>
                </div>
                <div>
                    <Popover
                        trigger={['click']}
                        destroyTooltipOnHide
                        overlayInnerStyle={{ padding: 0 }}
                        content={(
                            <CvatDropdownMenuPaper>
                                <Button
                                    className='cvat-create-task-button'
                                    type='primary'
                                    onClick={(): void => history.push('/tasks/create')}
                                    icon={<PlusOutlined />}
                                >
                                    Create a new task
                                </Button>
                                <Button
                                    className='cvat-create-multi-tasks-button'
                                    type='primary'
                                    onClick={(): void => history.push('/tasks/create?many=true')}
                                    icon={<span className='anticon'><MultiPlusIcon /></span>}
                                >
                                    Create multi tasks
                                </Button>
                                <Button
                                    className='cvat-import-task-button'
                                    type='primary'
                                    disabled={importing}
                                    icon={importing ? <LoadingOutlined /> : <UploadOutlined />}
                                    onClick={() => dispatch(importActions.openImportBackupModal('task'))}
                                >
                                    Create from backup
                                </Button>
                            </CvatDropdownMenuPaper>
                        )}
                    >
                        <Button type='primary' className='cvat-create-task-dropdown' icon={<PlusOutlined />} />
                    </Popover>
                </div>
            </Col>
        </Row>
    );
}
