using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Profile;
using Jahan.Handicraft.Model.UModel;
using Jahan.Handicraft.Model.UModel.URenderModel;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Web;
using Umbraco.Web.Mvc;
using Umbraco.Core.Cache;
namespace Jahan.Handicraft.Web.Mvc.UmbracoCms.App.Controllers
{
    public class BaseRenderMvcController<TBaseEntity> : RenderMvcController where TBaseEntity : BaseEntity
    {
        private int _numberOfChildrenInCache = 0;
        public BaseRenderMvcController()
        {
            BreadcrumbList = BList;
            ViewBag.BreadcrumbList = BreadcrumbList;
            ViewBag.PageTitle = PageTitle;
            ViewBag.MetaDescription = MetaDescription;
            ViewBag.MetaKeywords = MetaKeywords;
        }
        private BaseRenderModel<TBaseEntity> _instance;
        public BaseRenderModel<TBaseEntity> Instance
        {
            get
            {
                if (_instance == null)
                {
                    string cacheKey = CurrentContent.Id.ToString();
                    if (CacheActivate == true)
                    {
                        var objItemInCache = ApplicationContext.ApplicationCache.RuntimeCache.GetCacheItem(cacheKey);
                        if (objItemInCache == null)
                        {   // Data and number of children of it will store in cache.
                            _instance = StoreDataInCache(cacheKey);
                            _numberOfChildrenInCache = GetNumberOfChildrenInCache(cacheKey);
                        }
                        else
                        {   // Read data from cache.
                            var numberOfChildren = CurrentContent.Children.Count(); // The latest statistics the number of children
                            _numberOfChildrenInCache = GetNumberOfChildrenInCache(cacheKey);
                            if (_numberOfChildrenInCache != numberOfChildren)
                            {// It means some children added or removed from Node. Then the cache must be update.
                                _instance = StoreDataInCache(cacheKey);
                                _numberOfChildrenInCache = GetNumberOfChildrenInCache(cacheKey);
                            }
                            else
                            {   // It means there is no difference between data in cache and latest data.
                                _instance = objItemInCache.TryConvertTo<BaseRenderModel<TBaseEntity>>().Result;// ApplicationContext.ApplicationCache.RuntimeCache.GetCacheItem<BaseRenderModel<TBaseEntity>>(cacheKey);// as BaseRenderModel<TBaseEntity>;
                            }
                        }
                        //ApplicationContext.ApplicationCache.RuntimeCache.InsertCacheItem(cacheKey, () => _instance, TimeSpan.FromSeconds(5));
                    }
                    else
                    {
                        if (CacheActivate == false)
                            ClearCacheItem(cacheKey);
                        _instance = new BaseRenderModel<TBaseEntity>(CurrentContent, CurrentCultureInfo);
                    }

                }
                return _instance;
            }
            set
            {

            }
        }

        public virtual IPublishedContent CurrentContent
        {
            get
            {
                if (UmbracoContext.Current != null)
                    return UmbracoContext.Current.PublishedContentRequest.PublishedContent;
                return null;
            }
        }

        public virtual CultureInfo CurrentCultureInfo
        {
            get
            {
                if (UmbracoContext.Current != null)
                    return UmbracoContext.Current.PublishedContentRequest.PublishedContent.GetCulture();
                return null;
            }
        }


        public List<Breadcrumb> BreadcrumbList { get; set; }
        private List<Breadcrumb> _bList;
        private List<Breadcrumb> BList
        {
            get
            {
                if (_bList == null)
                {
                    _bList = Breadcrumb.Get(CurrentContent, CurrentCultureInfo);
                    ViewBag.BreadcrumbList = _bList;
                }
                return _bList;
            }
        }

        private string PageTitle
        {
            get { return Seo.GetPageTitle(CurrentContent, CurrentCultureInfo); }
        }
        private string MetaDescription
        {
            get { return Seo.GetMetaDescription(CurrentContent, CurrentCultureInfo); }
        }
        private string MetaKeywords
        {
            get { return Seo.GetMetaKeywords(CurrentContent, CurrentCultureInfo); }
        }

        private int CacheTimeValid
        {
            get { return CacheSettings.GetTimeValid(CurrentContent, CurrentCultureInfo); }
        }
        private bool? CacheActivate
        {
            get { return CacheSettings.GetActivate(CurrentContent, CurrentCultureInfo); }
        }

        private int GetNumberOfChildrenInCache(string cacheKey)
        {
            return ApplicationContext.ApplicationCache.RuntimeCache.GetCacheItem<int>(GenerateCacheKeyForChildOfProductCategory(cacheKey), () => _instance.Content.Children.Count());
        }

        private BaseRenderModel<TBaseEntity> StoreDataInCache(string cacheKey)
        {
            return ApplicationContext.ApplicationCache.RuntimeCache.GetCacheItem<BaseRenderModel<TBaseEntity>>
                                (cacheKey, () => new BaseRenderModel<TBaseEntity>(CurrentContent, CurrentCultureInfo), TimeSpan.FromSeconds(CacheTimeValid));
        }

        private string GenerateCacheKeyForChildOfProductCategory(string cacheKey)
        {
            return string.Format("{0}-child", cacheKey);
        }

        private void ClearCacheItem(string cacheKey)
        {
            ApplicationContext.ApplicationCache.RuntimeCache.ClearCacheItem(cacheKey);
            ApplicationContext.ApplicationCache.RuntimeCache.ClearCacheItem(GenerateCacheKeyForChildOfProductCategory(cacheKey));
        }
    }
}